"""Entity Scheduler Custom Component for Home Assistant."""

import asyncio
import logging
from datetime import timedelta
import uuid

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.storage import Store
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

DOMAIN = "entity_scheduler"
STORAGE_KEY = f"{DOMAIN}.schedules"
STORAGE_VERSION = 1

CONF_ENTITY_ID = "entity_id"
CONF_ACTION = "action"
CONF_DELAY_HOURS = "delay_hours"
CONF_DELAY_MINS = "delay_mins"
CONF_DELAY_SECS = "delay_secs"

SERVICE_SCHEDULE_ACTION = "schedule_action"

SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_ENTITY_ID): cv.entity_id,
        vol.Required(CONF_ACTION): cv.string,
        vol.Optional(CONF_DELAY_HOURS, default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional(CONF_DELAY_MINS, default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional(CONF_DELAY_SECS, default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Entity Scheduler component."""
    
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    
    # Load existing schedules
    schedules = await store.async_load()
    if schedules is None:
        schedules = {}
        
    hass.data[DOMAIN] = {
        "store": store,
        "schedules": schedules,
        "listeners": {}
    }

    async def _save_schedules():
        await store.async_save(hass.data[DOMAIN]["schedules"])

    @callback
    def _execute_schedule(schedule_id: str, schedule_data: dict):
        """Execute the scheduled action."""
        _LOGGER.debug("Executing scheduled action %s: %s", schedule_id, schedule_data)
        
        entity_id = schedule_data[CONF_ENTITY_ID]
        action = schedule_data[CONF_ACTION]
        
        # Dispatch based on the entity's domain
        domain = entity_id.split(".")[0]
        
        hass.async_create_task(
            hass.services.async_call(
                domain,
                action,
                {"entity_id": entity_id},
                context=None,
            )
        )
        
        # Cleanup
        if schedule_id in hass.data[DOMAIN]["schedules"]:
            del hass.data[DOMAIN]["schedules"][schedule_id]
        if schedule_id in hass.data[DOMAIN]["listeners"]:
            del hass.data[DOMAIN]["listeners"][schedule_id]
            
        hass.async_create_task(_save_schedules())

    def _schedule_task(schedule_id: str, schedule_data: dict):
        """Schedule the callback using async_track_point_in_time."""
        target_time = dt_util.parse_datetime(schedule_data["execute_at"])
        
        # If the target time is in the past, execute immediately (e.g. after restart if delayed)
        now = dt_util.utcnow()
        if target_time <= now:
            _execute_schedule(schedule_id, schedule_data)
            return

        @callback
        def _schedule_callback(now):
            _execute_schedule(schedule_id, schedule_data)

        # track the point in time
        listener = async_track_point_in_time(hass, _schedule_callback, target_time)
        hass.data[DOMAIN]["listeners"][schedule_id] = listener

    # Reschedule existing ones
    for schedule_id, schedule_data in list(schedules.items()):
        _schedule_task(schedule_id, schedule_data)

    async def async_handle_schedule_action(call: ServiceCall):
        """Handle the service call to schedule an action."""
        entity_id = call.data[CONF_ENTITY_ID]
        action = call.data[CONF_ACTION]
        delay_hours = call.data.get(CONF_DELAY_HOURS, 0)
        delay_mins = call.data.get(CONF_DELAY_MINS, 0)
        delay_secs = call.data.get(CONF_DELAY_SECS, 0)

        if delay_hours == 0 and delay_mins == 0 and delay_secs == 0:
            _LOGGER.error("Entity Scheduler requires a delay time greater than 0")
            return

        execute_at = dt_util.utcnow() + timedelta(hours=delay_hours, minutes=delay_mins, seconds=delay_secs)
        schedule_id = str(uuid.uuid4())
        
        schedule_data = {
            CONF_ENTITY_ID: entity_id,
            CONF_ACTION: action,
            "execute_at": execute_at.isoformat(),
        }
        
        _LOGGER.debug(
            "Scheduling %s for %s at %s", action, entity_id, schedule_data["execute_at"]
        )

        hass.data[DOMAIN]["schedules"][schedule_id] = schedule_data
        await _save_schedules()
        
        _schedule_task(schedule_id, schedule_data)

    hass.services.async_register(
        DOMAIN,
        SERVICE_SCHEDULE_ACTION,
        async_handle_schedule_action,
        schema=SCHEDULE_SCHEMA,
    )

    return True
