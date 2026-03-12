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

        if (this._config && this._config.entity && !this._initialActionSet && hass.states[this._config.entity]) {
            const defaultAction = this._config.default_action || "auto"; // "auto", "turn_on", "turn_off", "toggle"

            if (defaultAction !== "auto" && ["turn_on", "turn_off", "toggle"].includes(defaultAction)) {
                this.selectedAction = defaultAction;
            } else {
                const stateObj = hass.states[this._config.entity];
                this.selectedAction = stateObj.state === 'on' ? 'turn_off' : 'turn_on';
            }
            if (this.querySelector(".segmented-control")) {
                this.querySelector(".segmented-control").setAttribute("data-selected", this.selectedAction);
                this.querySelectorAll(".segment-btn").forEach(c => c.classList.remove("active"));
                const activeBtn = this.querySelector(`.segment-btn[data-action="${this.selectedAction}"]`);
                if (activeBtn) activeBtn.classList.add("active");
            }
            this._initialActionSet = true;
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

        // Close the browser_mod popup specifically on this device via frontend DOM event
        const event = new Event('ll-custom', { bubbles: true, composed: true });
        event.detail = {
            browser_mod: {
                service: "browser_mod.close_popup",
                data: {}
            }
        };
        this.dispatchEvent(event);
    }
}

customElements.define("entity-scheduler-ui", EntitySchedulerUI);


class EntitySchedulerWrapper extends HTMLElement {
    static getConfigElement() {
        return document.createElement("entity-scheduler-wrapper-editor");
    }

    static getStubConfig() {
        return {
            show_status_bar: true,
            status_bar_timer_change_duration: 600,
            popup_title: "Schedule Action",
            status_bar_position: "top_right",
            default_action: "auto",
            trigger_action: "hold",
            card: {
                type: "button"
            }
        };
    }

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

        const showStatusBar = this._config.show_status_bar !== false;

        if (showStatusBar) {
            this._overlayTemplate = document.createElement("div");

            const position = this._config.status_bar_position || "top_right";
            let positionCss = "";
            let radiusCss = "";

            if (position === "top_left") {
                positionCss = "top: 0px; left: 0px;";
                radiusCss = "border-top-left-radius: var(--ha-card-border-radius, 12px); border-bottom-right-radius: var(--ha-card-border-radius, 12px);";
            } else if (position === "bottom_right") {
                positionCss = "bottom: 0px; right: 0px;";
                radiusCss = "border-bottom-right-radius: var(--ha-card-border-radius, 12px); border-top-left-radius: var(--ha-card-border-radius, 12px);";
            } else if (position === "bottom_left") {
                positionCss = "bottom: 0px; left: 0px;";
                radiusCss = "border-bottom-left-radius: var(--ha-card-border-radius, 12px); border-top-right-radius: var(--ha-card-border-radius, 12px);";
            } else { // default top_right
                positionCss = "top: 0px; right: 0px;";
                radiusCss = "border-top-right-radius: var(--ha-card-border-radius, 12px); border-bottom-left-radius: var(--ha-card-border-radius, 12px);";
            }

            this._overlayTemplate.style.cssText = `
                position: absolute;
                ${positionCss}
                width: fit-content;
                min-width: 50%;
                max-width: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                color: #fff;
                padding: 4px 8px;
                font-size: 11.5px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                ${radiusCss}
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
                max-height: 28px;
                box-sizing: border-box;
                transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s, opacity 0.3s;
                z-index: 10;
            `;

            this._overlayTemplate.addEventListener("click", (e) => {
                e.stopPropagation();

                // Toggle expansion
                const toggleBtn = e.target.closest(".schedule-toggle");
                if (toggleBtn) {
                    this._expanded = !this._expanded;
                    this._updateScheduleText();
                    return;
                }

                // Cancel action
                const cancelBtn = e.target.closest(".schedule-cancel");
                if (cancelBtn) {
                    const sid = cancelBtn.dataset.scheduleId;
                    if (sid) {
                        this._hass.callService("entity_scheduler", "cancel_schedule", {
                            schedule_id: sid
                        });

                        // Optimistic update
                        if (this._mySchedules) {
                            this._mySchedules = this._mySchedules.filter(s => s.schedule_id !== sid);
                            if (this._mySchedules.length === 0) {
                                this._overlayTemplate.style.opacity = "0";
                                this._overlayTemplate.style.pointerEvents = "none";
                            } else {
                                this._updateScheduleText();
                            }
                        }
                    }
                    return;
                }

                // Add Time action
                const addTimeBtn = e.target.closest(".schedule-add-time");
                if (addTimeBtn) {
                    const sid = addTimeBtn.dataset.scheduleId;
                    const secs = parseInt(addTimeBtn.dataset.seconds, 10);
                    if (sid && secs) {
                        this._hass.callService("entity_scheduler", "add_time", {
                            schedule_id: sid,
                            seconds: secs
                        });
                    }
                    return;
                }

                // Subtract Time action
                const subTimeBtn = e.target.closest(".schedule-sub-time");
                if (subTimeBtn) {
                    const sid = subTimeBtn.dataset.scheduleId;
                    const secs = parseInt(subTimeBtn.dataset.seconds, 10);
                    if (sid && secs) {
                        this._hass.callService("entity_scheduler", "add_time", {
                            schedule_id: sid,
                            seconds: secs
                        });
                    }
                    return;
                }
            });

            this.appendChild(this._overlayTemplate);
        }

        this._setupHoldEvent();

        if (!this._fetchInterval) {
            this._fetchInterval = setInterval(() => this._fetchSchedules(), 2000);
            setTimeout(() => this._fetchSchedules(), 100);
        }
    }

    _setupHoldEvent() {
        const triggerAction = this._config.trigger_action || "hold"; // "hold", "tap", "double_tap"

        if (triggerAction === "hold") {
            let holdTimer;
            let heldDown = false;

            // Use event capturing to intercept interactions before the child card handles them as taps
            this.addEventListener("pointerdown", (e) => {
                heldDown = true;
                holdTimer = setTimeout(() => {
                    if (heldDown) {
                        this._handleAction(e);
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
        } else if (triggerAction === "tap") {
            this.addEventListener("click", (e) => {
                this._handleAction(e);
            }, { capture: true });
        } else if (triggerAction === "double_tap") {
            this.addEventListener("dblclick", (e) => {
                this._handleAction(e);
            }, { capture: true });
        }
    }

    _handleAction(e) {
        if (!this._hass) return;

        // We block the default long press logic (e.g. standard info dialogs)
        e.stopPropagation();
        e.preventDefault();

        const entityId = this._config.card?.entity;

        if (!entityId) {
            console.warn("Entity Scheduler: No entity provided in child card for hold action.");
            return;
        }

        const popupTitle = this._config.popup_title || "Schedule Action";

        // Trigger browser_mod popup via the native 'll-custom' DOM event
        // This flawlessly captures only the current browser without needing explicit IDs
        const event = new Event('ll-custom', { bubbles: true, composed: true });
        event.detail = {
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: popupTitle,
                    content: {
                        type: "custom:entity-scheduler-ui",
                        entity: entityId
                    }
                }
            }
        };
        this.dispatchEvent(event);
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
        const entityId = this._config.card?.entity;
        if (!entityId) return;

        try {
            const schedules = await this._hass.connection.sendMessagePromise({
                type: 'entity_scheduler/get_schedules'
            });

            const mySchedules = schedules.filter(s => s.entity_id === entityId);

            if (mySchedules.length > 0) {
                mySchedules.sort((a, b) => new Date(a.execute_at) - new Date(b.execute_at));
                this._mySchedules = mySchedules;
                this._overlayTemplate.style.opacity = "1";
                this._overlayTemplate.style.pointerEvents = "auto";

                if (!this._tickInterval) {
                    this._tickInterval = setInterval(() => this._updateScheduleText(), 1000);
                }
                this._updateScheduleText();
            } else {
                this._mySchedules = [];
                if (this._overlayTemplate) {
                    this._overlayTemplate.style.opacity = "0";
                    this._overlayTemplate.style.pointerEvents = "none";
                    this._expanded = false;
                    this._overlayTemplate.style.maxHeight = "28px";
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
        if (!this._mySchedules || this._mySchedules.length === 0 || !this._overlayTemplate) return;

        const now = new Date();
        const formatTime = (executeAtStr, action) => {
            const executeAt = new Date(executeAtStr);
            const diffSeconds = Math.max(0, Math.floor((executeAt - now) / 1000));

            const h = Math.floor(diffSeconds / 3600);
            const m = Math.floor((diffSeconds % 3600) / 60);
            const s = diffSeconds % 60;

            let timeStr = "";
            if (h > 0) timeStr += `${h}h `;
            if (m > 0 || h > 0) timeStr += `${m}m `;
            timeStr += `${s}s`;

            let actionIcon = "mdi:clock-outline";
            if (action === "turn_on") actionIcon = "mdi:toggle-switch";
            else if (action === "turn_off") actionIcon = "mdi:toggle-switch-off-outline";
            else if (action === "toggle") actionIcon = "mdi:swap-horizontal";

            return `<ha-icon icon="${actionIcon}" style="--mdc-icon-size: 16px; margin-right: 4px; vertical-align: middle;"></ha-icon><span style="vertical-align: middle;">${timeStr.trim()}</span>`;
        };

        const changeSeconds = this._config.status_bar_timer_change_duration !== undefined ? parseInt(this._config.status_bar_timer_change_duration, 10) : 600;

        const nearest = this._mySchedules[0];

        let html = `
            <style>
                .schedule-icon-btn {
                    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s;
                }
                .schedule-icon-btn:active {
                    transform: scale(0.75);
                    opacity: 1 !important;
                }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 20px; flex-shrink: 0;">
                <div style="flex: 1; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${this._mySchedules.length > 1 ? '<span style="opacity: 0.7;">Next: </span>' : ''}${formatTime(nearest.execute_at, nearest.action)}
                </div>
                <div style="display: flex; gap: 8px; pointer-events: auto; align-items: center;">
                    <ha-icon icon="mdi:minus-circle-outline" class="schedule-sub-time schedule-icon-btn" data-schedule-id="${nearest.schedule_id}" data-seconds="-${changeSeconds}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 18px; color: #fff;"></ha-icon>
                    <ha-icon icon="mdi:plus-circle-outline" class="schedule-add-time schedule-icon-btn" data-schedule-id="${nearest.schedule_id}" data-seconds="${changeSeconds}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 18px; color: #fff;"></ha-icon>
                    ${this._mySchedules.length > 1 ? `<ha-icon icon="${this._expanded ? 'mdi:chevron-down' : 'mdi:chevron-up'}" class="schedule-toggle schedule-icon-btn" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 20px; margin-right: 4px; margin-left: 4px;"></ha-icon>` : '<div style="width: 8px;"></div>'}
                    <ha-icon icon="mdi:close" class="schedule-cancel schedule-icon-btn" data-schedule-id="${nearest.schedule_id}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 16px; color: #ff5252;"></ha-icon>
                </div>
            </div>
        `;

        if (this._mySchedules.length > 1) {
            html += `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">`;
            for (let i = 1; i < this._mySchedules.length; i++) {
                const sched = this._mySchedules[i];
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="flex: 1; opacity: 0.85; font-size: 11px;">${formatTime(sched.execute_at, sched.action)}</div>
                        <div style="display: flex; gap: 8px; pointer-events: auto; align-items: center;">
                            <ha-icon icon="mdi:minus-circle-outline" class="schedule-sub-time schedule-icon-btn" data-schedule-id="${sched.schedule_id}" data-seconds="-${changeSeconds}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 16px; color: #fff;"></ha-icon>
                            <ha-icon icon="mdi:plus-circle-outline" class="schedule-add-time schedule-icon-btn" data-schedule-id="${sched.schedule_id}" data-seconds="${changeSeconds}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 16px; color: #fff;"></ha-icon>
                            <div style="width: 8px;"></div>
                            <ha-icon icon="mdi:close" class="schedule-cancel schedule-icon-btn" data-schedule-id="${sched.schedule_id}" style="cursor: pointer; opacity: 0.8; --mdc-icon-size: 14px; color: #ff5252;"></ha-icon>
                        </div>
                    </div>
                `;
            }
            html += `</div>`;

            if (this._expanded) {
                this._overlayTemplate.style.maxHeight = "400px";
                this._overlayTemplate.style.padding = "4px 8px 8px 8px";
            } else {
                this._overlayTemplate.style.maxHeight = "28px";
                this._overlayTemplate.style.padding = "4px 8px";
            }
        } else {
            this._expanded = false;
            this._overlayTemplate.style.maxHeight = "28px";
            this._overlayTemplate.style.padding = "4px 8px";
        }

        this._overlayTemplate.innerHTML = html;
    }
}

class EntitySchedulerWrapperEditor extends HTMLElement {
    setConfig(config) {
        this._config = config;

        if (this._form) {
            this._form.data = this._config;
        }
        if (this._cardEditor) {
            this._cardEditor.value = this._config.card;
        }

        if (!this._initialized) {
            this._tryRender();
        }
    }

    set hass(hass) {
        this._hass = hass;
        if (this._form) {
            this._form.hass = hass;
        }
        if (this._cardEditor) {
            this._cardEditor.hass = hass;
        }

        if (!this._initialized) {
            this._tryRender();
        }
    }

    set lovelace(ll) {
        this._lovelace = ll;
        if (this._cardEditor) {
            this._cardEditor.lovelace = ll;
        }
    }

    async _tryRender() {
        if (!this._hass || !this._config || this._rendering) {
            return;
        }
        this._rendering = true;

        if (window.loadCardHelpers) {
            await window.loadCardHelpers();
        }

        const schema = [
            { name: "show_status_bar", selector: { boolean: {} } },
            { name: "status_bar_timer_change_duration", selector: { number: { min: 1, mode: "box" } } },
            { name: "popup_title", selector: { text: {} } },
            {
                name: "status_bar_position",
                selector: {
                    select: {
                        options: [
                            { value: "top_right", label: "Top Right" },
                            { value: "top_left", label: "Top Left" },
                            { value: "bottom_right", label: "Bottom Right" },
                            { value: "bottom_left", label: "Bottom Left" }
                        ]
                    }
                }
            },
            {
                name: "default_action",
                selector: {
                    select: {
                        options: [
                            { value: "auto", label: "Auto" },
                            { value: "turn_on", label: "Turn On" },
                            { value: "turn_off", label: "Turn Off" },
                            { value: "toggle", label: "Toggle" }
                        ]
                    }
                }
            },
            {
                name: "trigger_action",
                selector: {
                    select: {
                        options: [
                            { value: "hold", label: "Hold" },
                            { value: "tap", label: "Tap" },
                            { value: "double_tap", label: "Double Tap" }
                        ]
                    }
                }
            }
        ];

        this.innerHTML = "";
        const form = document.createElement("ha-form");
        form.hass = this._hass;
        form.data = this._config;
        form.schema = schema;
        form.computeLabel = (s) => {
            switch (s.name) {
                case "show_status_bar": return "Show Status Bar";
                case "status_bar_timer_change_duration": return "Status Bar Timer Change Duration (seconds)";
                case "popup_title": return "Popup Title";
                case "status_bar_position": return "Status Bar Position";
                case "default_action": return "Default Action";
                case "trigger_action": return "Trigger Action";
                default: return s.name;
            }
        };

        this._form = form;

        form.addEventListener("value-changed", (ev) => {
            ev.stopPropagation();
            const newConfig = ev.detail.value;

            this.dispatchEvent(new CustomEvent("config-changed", {
                detail: { config: newConfig },
                bubbles: true,
                composed: true,
            }));
        });

        // Add the visual card editor for the wrapped card
        const cardEditor = document.createElement("hui-card-element-editor");
        cardEditor.hass = this._hass;
        if (this._lovelace) {
            cardEditor.lovelace = this._lovelace;
        }
        cardEditor.value = this._config.card;
        cardEditor.addEventListener("config-changed", (ev) => {
            ev.stopPropagation();
            if (!ev.detail.value) return;

            const newConfig = { ...this._config, card: ev.detail.value };
            this.dispatchEvent(new CustomEvent("config-changed", {
                detail: { config: newConfig },
                bubbles: true,
                composed: true,
            }));
        });

        this._cardEditor = cardEditor;

        const cardLabel = document.createElement("h3");
        cardLabel.textContent = "Inner Card Configuration";
        cardLabel.style.margin = "24px 0 8px 0";
        cardLabel.style.fontSize = "16px";
        cardLabel.style.fontWeight = "400";
        cardLabel.style.color = "var(--primary-text-color)";

        this.appendChild(form);
        this.appendChild(cardLabel);
        this.appendChild(cardEditor);

        this._initialized = true;
        this._rendering = false;
    }
}

customElements.define("entity-scheduler-wrapper-editor", EntitySchedulerWrapperEditor);
customElements.define("entity-scheduler-wrapper", EntitySchedulerWrapper);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "entity-scheduler-wrapper",
    name: "Entity Scheduler Wrapper",
    description: "A wrapper card that intercepts hold actions and provides a custom scheduling popup."
});
