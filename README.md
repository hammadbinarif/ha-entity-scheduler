# Entity Scheduler

A robust custom integration and Lovelace custom card for Home Assistant, designed to let you effortlessly schedule state changes (`turn_on`, `turn_off`, `toggle`) for your entities directly from your dashboard UI.

It provides a transparent "Wrapper Card" that you place around your existing dashboard buttons or cards. When interacted with, it dynamically pops up a dedicated time selection menu so you can schedule future actions for that precise entity. 

Any active schedules are gracefully displayed as a stylish, floating status bar inside your card—showing the countdown time, and offering quick-action buttons to manually cancel the schedule or add/subtract time adjustments without reopening the main popup.

## Features

- **Intuitive UI:** A clean, easy-to-use time scroller popup that lets you delay actions by hours, minutes, or seconds.
- **Dynamic Status Bar:** Live countdown overlay on your existing dashboard cards displaying the pending action ("Will Turn on/off...").
- **Quick Adjustments:** Add or subtract 10 minutes (or a custom amount) to the running timer directly from the status bar, or instantly cancel the schedule altogether.
- **Optimistic Updates:** UI immediately reflects added schedules and cancellations for a snappy, fluid user experience.
- **Visual Editor Support:** Configure the wrapper, the behavior, and nest your favorite cards via Home Assistant's native Lovelace visual editor (No YAML required!).
- **Multi-Schedule Support:** Schedule multiple sequential actions on the same entity and cycle through them from the drop-down chevron on the status bar.

## Prerequisites

- For the scheduling popup to display, you MUST have the [browser_mod](https://github.com/thomasloven/hass-browser_mod) integration installed and configured in Home Assistant. This is what handles rendering the custom popup over your dashboard natively.

## Installation

### Via HACS (Recommended)

1. Open HACS.
2. Under Integrations, tap the `+` or three dots in the top right to open **Custom Repositories**.
3. Paste the URL to this GitHub Repository and select `Integration` as the category.
4. Download the repository.
5. Restart Home Assistant.
6. Make sure to **clear your browser cache** (Ctrl+F5) to load the new Lovelace Javascript resources!

> **Note:** Do not forget to go to **Settings -> Devices & Services -> Add Integration** and configure the `Entity Scheduler` integration to initialize the backend services!

## Wrapping Your Cards

You configure the Entity Scheduler primarily through your Lovelace dashboards. Add a new card to your dashboard and search for the **Entity Scheduler Wrapper**.

### Visual Editor

The Visual Editor allows you to easily customize the behavior. It utilizes Home Assistant's native `<ha-form>` and `<hui-card-element-editor>` to render a seamless configuration page:

- **Show Status Bar:** Toggle the visibility of the visual countdown bar.
- **Timer Change Duration:** How many seconds the `+` and `-` buttons on the active status bar will add or subtract from a running schedule. (Default: 600s / 10m).
- **Popup Title:** The title displayed at the top of the scheduling popup. (Default: "Schedule Action").
- **Status Bar Position:** Where the live countdown box pins itself over your inner card (`Top Right`, `Top Left`, `Bottom Right`, `Bottom Left`).
- **Default Action:** What action (`Turn On`, `Turn Off`, `Toggle`) the schedule popup defaults to selecting when opened. Choose `Auto` to let it infer the best inverse action from the device's current state.
- **Trigger Action:** Decide what interaction on the card triggers the schedule popup (`Hold`, `Tap`, `Double Tap`).
- **Inner Card Configuration:** Use standard Home Assistant visual card pickers to embed whichever button or entity card you normally use for your devices!

### YAML Configuration Example

If you prefer building your dashboards in YAML, the config looks like this:

```yaml
type: custom:entity-scheduler-wrapper
# Configuration properties:
show_status_bar: true
status_bar_timer_change_duration: 600
popup_title: "Bedroom Timer"
status_bar_position: top_right
default_action: auto
trigger_action: hold

# Nest your standard card here
card:
  type: custom:mushroom-light-card # Or standard 'button', etc.
  entity: light.bedroom
```

## Backend Services

The integration also exposes standard Home Assistant services, allowing you to trigger scheduling via Node-RED, Automations, or Scripts!

### `entity_scheduler.schedule_action`
Schedules a new action for a device.
- `entity_id`: The target entity (e.g. `switch.porch_lights`)
- `action`: `turn_on`, `turn_off`, or `toggle`
- `delay_hours`: Hours to wait
- `delay_mins`: Minutes to wait
- `delay_secs`: Seconds to wait

### `entity_scheduler.add_time`
Adjusts the remaining time on an existing schedule.
- `schedule_id`: The internal ID of the active schedule.
- `seconds`: Time in seconds to add (use negative values like `-600` to subtract time).
