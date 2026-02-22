class EntitySchedulerUI extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
            this.innerHTML = `
        <style>
          /* Segmented Control Styles */
          .segmented-control { display: flex; position: relative; background: var(--secondary-background-color, rgba(120, 120, 120, 0.1)); border-radius: 20px; padding: 4px; margin-bottom: 24px; }
          .segment-btn { flex: 1; padding: 12px 0; border: none; background: transparent; cursor: pointer; color: var(--primary-text-color, #fff); font-weight: bold; font-size: 14px; text-align: center; z-index: 1; transition: color 0.3s; }
          .segment-btn.active { color: #fff; }
          .segment-highlight { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(33.333% - 2.66px); background: var(--primary-color, #03a9f4); border-radius: 16px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; box-shadow: 0 2px 4px rgba(3, 169, 244, 0.3); }
          .segmented-control[data-selected="turn_on"] .segment-highlight { transform: translateX(0); }
          .segmented-control[data-selected="turn_off"] .segment-highlight { transform: translateX(calc(100% + 4px)); }
          .segmented-control[data-selected="toggle"] .segment-highlight { transform: translateX(calc(200% + 8px)); }

          .time-display-container { display: flex; flex-direction: column; align-items: center; margin: 0 0 20px 0; }
          .time-display-prefix { font-size: 16px; font-weight: bold; color: var(--secondary-text-color, #888); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; z-index: 1; }
          .time-display { font-size: 3.5rem; font-weight: 300; text-align: center; color: var(--primary-text-color, #000); margin: 0; font-variant-numeric: tabular-nums; text-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .time-controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
          .time-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
          .time-label { width: 60px; font-size: 14px; font-weight: bold; color: var(--secondary-text-color, #888); text-align: right; text-transform: uppercase; letter-spacing: 1px; }
          .time-btn-group { display: flex; flex: 1; gap: 8px; }
          .time-btn { flex: 1; padding: 12px 0; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 16px; text-align: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .time-btn:active { transform: scale(0.95); }
          .time-btn.add { background: var(--primary-color, #03a9f4); color: #fff; }
          .time-btn.add:hover { filter: brightness(1.1); box-shadow: 0 4px 8px rgba(3,169,244,0.3); }
          .time-btn.sub { background: var(--secondary-background-color, #e0e0e0); color: var(--primary-text-color, #333); }
          .time-btn.sub.active-sub { background: var(--error-color, #f44336); color: #fff; }
          .time-btn.sub:hover { filter: brightness(0.95); }
          .time-btn.sub:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; filter: grayscale(1); }
          
          .actions { display: flex; justify-content: center; margin-top: 8px; }
          .main-btn { width: 100%; padding: 16px; background: var(--primary-color, #03a9f4); color: #fff; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 18px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(3,169,244,0.3); transition: all 0.2s; }
          .main-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(3,169,244,0.4); }
          .main-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; filter: grayscale(1); }
        </style>
        <div class="scheduler-form">
          <div class="segmented-control" id="action-select-group" data-selected="turn_on">
            <div class="segment-highlight"></div>
            <button class="segment-btn active" data-action="turn_on">Turn On</button>
            <button class="segment-btn" data-action="turn_off">Turn Off</button>
            <button class="segment-btn" data-action="toggle">Toggle</button>
          </div>
          
          <div class="time-display-container">
            <div class="time-display-prefix">in</div>
            <div class="time-display" id="time-display">00m 00s</div>
          </div>
          
          <div class="time-controls">
            <div class="time-row">
              <div class="time-label">Secs</div>
              <div class="time-btn-group">
                <button class="time-btn sub" data-sec="-10">-10s</button>
                <button class="time-btn sub" data-sec="-1">-1s</button>
                <button class="time-btn add" data-sec="1">+1s</button>
                <button class="time-btn add" data-sec="10">+10s</button>
              </div>
            </div>

            <div class="time-row">
              <div class="time-label">Mins</div>
              <div class="time-btn-group">
                <button class="time-btn sub active-sub" data-sec="-600">-10m</button>
                <button class="time-btn sub active-sub" data-sec="-60">-1m</button>
                <button class="time-btn add" data-sec="60">+1m</button>
                <button class="time-btn add" data-sec="600">+10m</button>
              </div>
            </div>
            
            <div class="time-row">
              <div class="time-label">Hours</div>
              <div class="time-btn-group">
                <button class="time-btn sub active-sub" data-sec="-18000">-5h</button>
                <button class="time-btn sub active-sub" data-sec="-3600">-1h</button>
                <button class="time-btn add" data-sec="3600">+1h</button>
                <button class="time-btn add" data-sec="18000">+5h</button>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="main-btn" id="schedule-btn" disabled>Schedule</button>
          </div>
        </div>
      `;
            this.content = true;
            this.totalSeconds = 0;
            this.selectedAction = "turn_on";

            this.querySelectorAll(".segment-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    this.querySelectorAll(".segment-btn").forEach(c => c.classList.remove("active"));
                    const targetBtn = e.currentTarget;
                    targetBtn.classList.add("active");
                    this.selectedAction = targetBtn.dataset.action;

                    // Slide the highlight
                    this.querySelector(".segmented-control").setAttribute("data-selected", this.selectedAction);
                });
            });

            this.querySelectorAll(".time-btn").forEach(btn => {
                btn.addEventListener("click", (e) => this._handleTimeClick(e));
            });

            this.querySelector("#schedule-btn").addEventListener("click", () => {
                this._scheduleAction();
            });

            this._updateDisplay();
        }
    }

    _handleTimeClick(e) {
        const delta = parseInt(e.target.dataset.sec, 10);
        let newTotal = this.totalSeconds + delta;

        // Floor at 0 seconds instead of blocking subtractions
        if (newTotal < 0) {
            newTotal = 0;
        }

        this.totalSeconds = newTotal;
        this._updateDisplay();
    }

    _updateDisplay() {
        const h = Math.floor(this.totalSeconds / 3600);
        const m = Math.floor((this.totalSeconds % 3600) / 60);
        const s = this.totalSeconds % 60;

        let displayStr = "";
        if (h > 0) {
            displayStr = `${h}h ` + displayStr;
        }

        // Always show minutes and seconds
        displayStr += `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;

        this.querySelector("#time-display").textContent = displayStr;

        // Disable schedule button if 0s
        this.querySelector("#schedule-btn").disabled = (this.totalSeconds === 0);
    }

    setConfig(config) {
        this._config = config;
        if (!this._config.entity) {
            throw new Error("Entity is required for scheduler ui.");
        }
    }

    _scheduleAction() {
        if (!this._hass || !this._config.entity || this.totalSeconds === 0) return;

        const action = this.selectedAction;
        const hours = Math.floor(this.totalSeconds / 3600);
        const mins = Math.floor((this.totalSeconds % 3600) / 60);
        const secs = this.totalSeconds % 60;

        this._hass.callService("entity_scheduler", "schedule_action", {
            entity_id: this._config.entity,
            action: action,
            delay_hours: hours,
            delay_mins: mins,
            delay_secs: secs
        });

        // Close the browser_mod popup via standard Home Assistant service call
        this._hass.callService("browser_mod", "close_popup", {});
    }
}

customElements.define("entity-scheduler-ui", EntitySchedulerUI);


class EntitySchedulerWrapper extends HTMLElement {
    setConfig(config) {
        if (!config || !config.card) {
            throw new Error("You need to define a 'card' object in the configuration");
        }
        this._config = config;

        if (!this._card) {
            this._createCard();
        } else {
            this._card.setConfig(config.card);
        }
    }

    set hass(hass) {
        this._hass = hass;
        if (this._card) {
            this._card.hass = hass;
        }
    }

    async _createCard() {
        this.style.display = "block";
        this.style.position = "relative";

        let tag = this._config.card.type;
        if (tag.startsWith("custom:")) {
            tag = tag.substr(7);
        } else {
            tag = `hui-${tag}-card`;
        }

        if (window.loadCardHelpers) {
            const helpers = await window.loadCardHelpers();
            this._card = helpers.createCardElement(this._config.card);
        } else {
            this._card = document.createElement(tag);
            this._card.setConfig(this._config.card);
        }

        this.appendChild(this._card);

        this._overlayTemplate = document.createElement("div");
        this._overlayTemplate.style.cssText = `
            position: absolute;
            bottom: 0px;
            left: 0px;
            right: 0px;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: #fff;
            padding: 8px 12px;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom-left-radius: var(--ha-card-border-radius, 12px);
            border-bottom-right-radius: var(--ha-card-border-radius, 12px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
            z-index: 10;
        `;

        this._overlayTemplate.innerHTML = `
            <div style="flex: 1; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5);" class="schedule-text"></div>
            <div style="display: flex; gap: 12px; pointer-events: auto;">
                <ha-icon icon="mdi:pencil" class="schedule-edit" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 16px;"></ha-icon>
                <ha-icon icon="mdi:close" class="schedule-cancel" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 16px; color: #ff5252;"></ha-icon>
            </div>
        `;

        this.appendChild(this._overlayTemplate);

        this._overlayTemplate.querySelector(".schedule-edit").addEventListener("click", (e) => {
            e.stopPropagation();
            this._handleHold(e);
        });

        this._overlayTemplate.querySelector(".schedule-cancel").addEventListener("click", (e) => {
            e.stopPropagation();
            if (this._activeScheduleId) {
                this._hass.callService("entity_scheduler", "cancel_schedule", {
                    schedule_id: this._activeScheduleId
                });
                this._overlayTemplate.style.opacity = "0";
                this._overlayTemplate.style.pointerEvents = "none";
                this._activeScheduleId = null;
            }
        });

        this._setupHoldEvent();

        if (!this._fetchInterval) {
            this._fetchInterval = setInterval(() => this._fetchSchedules(), 2000);
            setTimeout(() => this._fetchSchedules(), 100);
        }
    }

    _setupHoldEvent() {
        let holdTimer;
        let heldDown = false;

        // Use event capturing to intercept interactions before the child card handles them as taps
        this.addEventListener("pointerdown", (e) => {
            heldDown = true;
            holdTimer = setTimeout(() => {
                if (heldDown) {
                    this._handleHold(e);
                    heldDown = false;
                }
            }, 500); // 500ms delay for hold_action
        }, { capture: true });

        this.addEventListener("pointerup", () => {
            heldDown = false;
            clearTimeout(holdTimer);
        }, { capture: true });

        this.addEventListener("pointerleave", () => {
            heldDown = false;
            clearTimeout(holdTimer);
        }, { capture: true });
    }

    _handleHold(e) {
        if (!this._hass) return;

        // We block the default long press logic (e.g. standard info dialogs)
        e.stopPropagation();
        e.preventDefault();

        const entityId = this._config.entity || this._config.card.entity;

        if (!entityId) {
            console.warn("Entity Scheduler: No entity provided in configuration or child card for hold action.");
            return;
        }

        // Trigger browser_mod popup via service call
        this._hass.callService("browser_mod", "popup", {
            title: "Schedule Action",
            content: {
                type: "custom:entity-scheduler-ui",
                entity: entityId
            }
        });
    }

    getCardSize() {
        return this._card && typeof this._card.getCardSize === "function" ? this._card.getCardSize() : 1;
    }

    disconnectedCallback() {
        if (this._fetchInterval) {
            clearInterval(this._fetchInterval);
            this._fetchInterval = null;
        }
        if (this._tickInterval) {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
        }
    }

    connectedCallback() {
        if (this._config && this._card && !this._fetchInterval) {
            this._fetchInterval = setInterval(() => this._fetchSchedules(), 2000);
            setTimeout(() => this._fetchSchedules(), 100);
        }
    }

    async _fetchSchedules() {
        if (!this._hass || !this._config) return;
        const entityId = this._config.entity || this._config.card?.entity;
        if (!entityId) return;

        try {
            const schedules = await this._hass.connection.sendMessagePromise({
                type: 'entity_scheduler/get_schedules'
            });

            const mySchedules = schedules.filter(s => s.entity_id === entityId);

            if (mySchedules.length > 0) {
                mySchedules.sort((a, b) => new Date(a.execute_at) - new Date(b.execute_at));
                this._activeSchedule = mySchedules[0];
                this._activeScheduleId = mySchedules[0].schedule_id;
                this._overlayTemplate.style.opacity = "1";
                this._overlayTemplate.style.pointerEvents = "auto";

                if (!this._tickInterval) {
                    this._tickInterval = setInterval(() => this._updateScheduleText(), 1000);
                }
                this._updateScheduleText();
            } else {
                this._activeSchedule = null;
                this._activeScheduleId = null;
                if (this._overlayTemplate) {
                    this._overlayTemplate.style.opacity = "0";
                    this._overlayTemplate.style.pointerEvents = "none";
                }
                if (this._tickInterval) {
                    clearInterval(this._tickInterval);
                    this._tickInterval = null;
                }
            }
        } catch (err) {
            console.error("Entity Scheduler fetch failed:", err);
        }
    }

    _updateScheduleText() {
        if (!this._activeSchedule || !this._overlayTemplate) return;

        const executeAt = new Date(this._activeSchedule.execute_at);
        const now = new Date();
        const diffSeconds = Math.max(0, Math.floor((executeAt - now) / 1000));

        const h = Math.floor(diffSeconds / 3600);
        const m = Math.floor((diffSeconds % 3600) / 60);
        const s = diffSeconds % 60;

        let timeStr = "";
        if (h > 0) timeStr += `${h}h `;
        if (m > 0 || h > 0) timeStr += `${m}m `;
        timeStr += `${s}s`;

        let actionStr = this._activeSchedule.action.replace("_", " ");

        const textElement = this._overlayTemplate.querySelector(".schedule-text");
        if (textElement) {
            textElement.textContent = `Will ${actionStr} in ${timeStr.trim()}`;
        }
    }
}

customElements.define("entity-scheduler-wrapper", EntitySchedulerWrapper);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "entity-scheduler-wrapper",
    name: "Entity Scheduler Wrapper",
    description: "A wrapper card that intercepts hold actions and provides a custom scheduling popup."
});
