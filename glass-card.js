/**
 * Glass Card — carte glassmorphism pour Home Assistant
 * https://github.com/mrcouscous49-ui/glass-card
 *
 * Une seule carte qui s'adapte au type d'entité :
 *  - interrupteurs, lumières, ventilateurs… → tuile avec toggle
 *  - capteurs (température, humidité…)     → tuile avec valeur
 */

const VERSION = "0.7.4";

const TOGGLE_DOMAINS = [
  "switch",
  "light",
  "fan",
  "input_boolean",
  "automation",
  "siren",
  "humidifier",
];
const ON_STATES = ["on", "open", "opening", "unlocked", "home", "playing", "heat", "cool", "auto"];
const DEFAULT_ACCENT = [52, 199, 89]; // vert iOS
const HOLD_MS = 500;

const STRINGS = {
  fr: {
    entity: "Entité",
    name: "Nom (optionnel)",
    icon: "Icône (optionnel)",
    icon_on: "Icône quand allumé (optionnel)",
    square: "Format carré",
    color: "Couleur d'accent",
    blur: "Flou de l'arrière-plan",
    opacity: "Opacité du verre",
    show_state: "Afficher l'état",
    icon_glow: "Icône illuminée quand allumé",
    entities: "Entités",
    columns: "Colonnes",
    unavailable: "Indisponible",
    required: "Glass Card : choisissez une entité (option « entity »)",
    required_grid: "Glass Grid Card : ajoutez au moins une entité (option « entities »)",
    required_climate: "Glass Thermostat Card : choisissez une entité climate (option « entity »)",
    show_modes: "Boutons de mode (chauffage / arrêt…)",
    st_off: "Éteint",
    st_heating: "En chauffe",
    st_cooling: "Refroidit",
    st_reached: "Consigne atteinte",
    st_waiting: "En attente",
    show_seconds: "Afficher les secondes",
    show_weekday: "Afficher le jour de la semaine",
    show_date: "Afficher la date",
    show_year: "Afficher l'année",
    show_saint: "Afficher la fête du jour",
    saint_prefix: "Fête du jour :",
    required_media: "Glass Media Card : choisissez une entité media_player (option « entity »)",
    show_artwork: "Pochette d'album en fond",
    show_volume: "Barre de volume",
    show_controls: "Boutons précédent / lecture / suivant",
    show_power: "Bouton marche / arrêt",
    required_weather: "Glass Weather Card : choisissez une entité weather (option « entity »)",
    show_details: "Détails (ressenti, humidité, vent)",
    show_hourly: "Prévisions par heure",
    show_daily: "Prévisions par jour",
    hours: "Nombre d'heures",
    days: "Nombre de jours",
    today: "Auj.",
    now: "Maint.",
    feels_like: "Ressenti",
    humidity: "Humidité",
    wind: "Vent",
    title: "Titre (optionnel)",
    show_count: "Afficher le compteur (présents / total)",
    members: "Membres",
    people: "Personnes",
    required_people: "Glass Members Card : ajoutez au moins une personne (option « entities »)",
  },
  en: {
    entity: "Entity",
    name: "Name (optional)",
    icon: "Icon (optional)",
    icon_on: "Icon when on (optional)",
    square: "Square",
    color: "Accent color",
    blur: "Background blur",
    opacity: "Glass opacity",
    show_state: "Show state",
    icon_glow: "Glowing icon when on",
    entities: "Entities",
    columns: "Columns",
    unavailable: "Unavailable",
    required: "Glass Card: please pick an entity (option \"entity\")",
    required_grid: "Glass Grid Card: add at least one entity (option \"entities\")",
    required_climate: "Glass Thermostat Card: please pick a climate entity (option \"entity\")",
    show_modes: "Mode buttons (heat / off…)",
    st_off: "Off",
    st_heating: "Heating",
    st_cooling: "Cooling",
    st_reached: "Target reached",
    st_waiting: "Waiting",
    show_seconds: "Show seconds",
    show_weekday: "Show weekday",
    show_date: "Show date",
    show_year: "Show year",
    show_saint: "Show name day (French calendar)",
    saint_prefix: "Name day:",
    required_media: "Glass Media Card: please pick a media_player entity (option \"entity\")",
    show_artwork: "Album art background",
    show_volume: "Volume bar",
    show_controls: "Previous / play / next buttons",
    show_power: "Power button",
    required_weather: "Glass Weather Card: please pick a weather entity (option \"entity\")",
    show_details: "Details (feels like, humidity, wind)",
    show_hourly: "Hourly forecast",
    show_daily: "Daily forecast",
    hours: "Number of hours",
    days: "Number of days",
    today: "Today",
    now: "Now",
    feels_like: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    title: "Title (optional)",
    show_count: "Show counter (home / total)",
    members: "Members",
    people: "People",
    required_people: "Glass Members Card: add at least one person (option \"entities\")",
  },
};

const tr = (hass, key) => {
  const lang = (hass?.language || navigator.language || "en").slice(0, 2);
  return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key] || key;
};

const domainOf = (entityId) => (entityId || "").split(".")[0];

const STYLE = `
  :host {
    display: block;
    height: 100%;
    --gc-accent: ${DEFAULT_ACCENT.join(", ")};
    --gc-backdrop: blur(15px) saturate(1.3);
    --gc-opacity: 0.1;
    container-type: inline-size;
  }
  :host([square]) {
    aspect-ratio: 1;
    height: auto;
  }
  ha-card {
    position: relative;
    height: 100%;
    min-height: 120px;
    box-sizing: border-box;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    color: #fff;
    background: rgba(255, 255, 255, var(--gc-opacity)) !important;
    backdrop-filter: var(--gc-backdrop);
    -webkit-backdrop-filter: var(--gc-backdrop);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    transition: transform 0.15s ease, background 0.3s ease, opacity 0.3s ease;
  }
  ha-card:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
  }
  ha-card.pressed {
    transform: scale(0.97);
  }
  ha-card.on {
    background: rgba(255, 255, 255, calc(var(--gc-opacity) + 0.08)) !important;
  }
  ha-card.unavailable {
    opacity: 0.5;
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .icon {
    width: 42px;
    height: 42px;
    flex: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    --mdc-icon-size: 24px;
    transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  }
  .on.glow .icon {
    color: rgb(var(--gc-accent));
    background: rgba(var(--gc-accent), 0.22);
    box-shadow: 0 0 18px rgba(var(--gc-accent), 0.35);
  }

  .switch {
    position: relative;
    width: 51px;
    height: 31px;
    flex: none;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.25);
    transition: background 0.25s ease;
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .on .switch {
    background: rgb(var(--gc-accent));
  }
  .on .knob {
    transform: translateX(20px);
  }

  .bottom {
    min-width: 0;
  }
  .value {
    font-size: 30px;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .unit {
    font-size: 16px;
    font-weight: 400;
    opacity: 0.75;
    margin-left: 2px;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [hidden] {
    display: none !important;
  }

  /* Tuiles étroites (grille sur petite largeur) : version compacte */
  @container (max-width: 130px) {
    ha-card {
      padding: 12px;
      min-height: 100px;
    }
    .icon {
      width: 34px;
      height: 34px;
      --mdc-icon-size: 20px;
    }
    .switch {
      width: 40px;
      height: 24px;
    }
    .knob {
      width: 20px;
      height: 20px;
    }
    .on .knob {
      transform: translateX(16px);
    }
    .name {
      font-size: 13px;
    }
    .value {
      font-size: 24px;
    }
  }
`;

class GlassCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._holdTimer = null;
    this._held = false;
  }

  static getConfigElement() {
    return document.createElement("glass-card-editor");
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {});
    const pick = (d) => ids.find((id) => id.startsWith(d + "."));
    return { entity: pick("light") || pick("switch") || pick("sensor") || "" };
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error(tr(this._hass, "required"));
    }
    this._config = { blur: 15, opacity: 10, show_state: true, icon_glow: true, square: true, ...config };
    this.toggleAttribute("square", this._config.square !== false);
    this._build();
    this._update();
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    const id = this._config?.entity;
    if (!prev || !id || prev.states[id] !== hass.states[id] || prev.language !== hass.language) {
      this._update();
    }
  }

  getCardSize() {
    return 2;
  }

  // Seule : carrée, de la même taille que les tuiles des grilles.
  getGridOptions() {
    return this._config?.square === false
      ? { columns: 6, rows: 2, min_columns: 3, min_rows: 2 }
      : { columns: 4, rows: "auto", min_columns: 3 };
  }

  /* ---------- DOM ---------- */

  _build() {
    if (this._card) return;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card tabindex="0" role="button">
        <div class="top">
          <div class="icon"><ha-state-icon></ha-state-icon></div>
          <div class="switch" hidden><div class="knob"></div></div>
        </div>
        <div class="bottom">
          <div class="value" hidden></div>
          <div class="name"></div>
          <div class="state"></div>
        </div>
      </ha-card>
    `;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._card = $("ha-card");
    this._icon = $("ha-state-icon");
    this._switch = $(".switch");
    this._value = $(".value");
    this._name = $(".name");
    this._state = $(".state");

    const card = this._card;
    card.addEventListener("pointerdown", (e) => this._onDown(e));
    card.addEventListener("pointerup", () => this._onUp());
    card.addEventListener("pointercancel", () => this._cancel());
    card.addEventListener("pointerleave", () => this._cancel());
    card.addEventListener("contextmenu", (e) => e.preventDefault());
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._tap();
      }
    });
  }

  _update() {
    if (!this._card || !this._config || !this._hass) return;
    const cfg = this._config;
    const stateObj = this._hass.states[cfg.entity];
    const style = this.style;

    // blur à 0 (tuiles d'une grille) : aucun backdrop-filter, sinon le navigateur
    // superpose deux effets de verre et dessine des lignes parasites.
    const blur = Number(cfg.blur);
    style.setProperty("--gc-backdrop", blur > 0 ? `blur(${blur}px) saturate(1.3)` : "none");
    style.setProperty("--gc-opacity", String(Number(cfg.opacity) / 100));

    if (!stateObj) {
      this._card.className = "unavailable";
      this._name.textContent = cfg.name || cfg.entity;
      this._state.textContent = tr(this._hass, "unavailable");
      this._switch.hidden = true;
      this._value.hidden = true;
      return;
    }

    const domain = domainOf(cfg.entity);
    const isToggle = TOGGLE_DOMAINS.includes(domain);
    const isOn = ON_STATES.includes(stateObj.state);
    const unavailable = ["unavailable", "unknown"].includes(stateObj.state);

    // Couleur d'accent : config > couleur réelle de la lumière > défaut
    let accent = cfg.color;
    if (!accent && domain === "light" && isOn && Array.isArray(stateObj.attributes.rgb_color)) {
      accent = stateObj.attributes.rgb_color;
    }
    style.setProperty("--gc-accent", (accent || DEFAULT_ACCENT).join(", "));

    this._card.className = [
      isOn && !unavailable ? "on" : "",
      unavailable ? "unavailable" : "",
      cfg.icon_glow !== false ? "glow" : "",
    ]
      .filter(Boolean)
      .join(" ");
    this._card.setAttribute("aria-label", this._displayName(stateObj));
    if (isToggle) this._card.setAttribute("aria-pressed", String(isOn));
    else this._card.removeAttribute("aria-pressed");

    this._icon.hass = this._hass;
    this._icon.stateObj = stateObj;
    this._icon.icon = (isOn && !unavailable && cfg.icon_on) || cfg.icon || undefined;

    this._name.textContent = this._displayName(stateObj);
    this._switch.hidden = !isToggle;

    const formatted = this._format(stateObj);
    if (isToggle) {
      this._value.hidden = true;
      this._state.hidden = !cfg.show_state;
      this._state.textContent = this._toggleSecondary(stateObj, formatted);
    } else {
      this._value.hidden = false;
      this._state.hidden = true;
      this._renderValue(stateObj, formatted);
    }
  }

  _displayName(stateObj) {
    return this._config.name || stateObj.attributes.friendly_name || this._config.entity;
  }

  _format(stateObj) {
    try {
      if (typeof this._hass.formatEntityState === "function") {
        return this._hass.formatEntityState(stateObj);
      }
    } catch (e) {
      /* fallback ci-dessous */
    }
    const unit = stateObj.attributes.unit_of_measurement;
    return unit ? `${stateObj.state} ${unit}` : stateObj.state;
  }

  _toggleSecondary(stateObj, formatted) {
    const b = stateObj.attributes.brightness;
    if (domainOf(stateObj.entity_id) === "light" && stateObj.state === "on" && typeof b === "number") {
      return `${formatted} · ${Math.round((b / 255) * 100)} %`;
    }
    return formatted;
  }

  _renderValue(stateObj, formatted) {
    const unit = stateObj.attributes.unit_of_measurement;
    this._value.textContent = "";
    if (unit && formatted.endsWith(unit)) {
      const num = formatted.slice(0, -unit.length).trim();
      this._value.append(document.createTextNode(num));
      const u = document.createElement("span");
      u.className = "unit";
      u.textContent = unit;
      this._value.append(u);
    } else {
      this._value.textContent = formatted;
    }
  }

  /* ---------- Interactions ---------- */

  _onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this._held = false;
    this._card.classList.add("pressed");
    clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      this._held = true;
      this._card.classList.remove("pressed");
      this._moreInfo();
    }, HOLD_MS);
  }

  _onUp() {
    const wasPending = this._holdTimer !== null;
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._card.classList.remove("pressed");
    if (wasPending && !this._held) this._tap();
  }

  _cancel() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._card?.classList.remove("pressed");
  }

  _tap() {
    const id = this._config.entity;
    const stateObj = this._hass?.states[id];
    if (stateObj && TOGGLE_DOMAINS.includes(domainOf(id)) && stateObj.state !== "unavailable") {
      this._hass.callService("homeassistant", "toggle", { entity_id: id });
      this._fire("haptic", "light");
    } else {
      this._moreInfo();
    }
  }

  _moreInfo() {
    this._fire("hass-more-info", { entityId: this._config.entity });
  }

  _fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
}

/* ---------- Carte grille : plusieurs interrupteurs dans un bloc de verre ---------- */

const GRID_STYLE = `
  :host {
    display: block;
    height: 100%;
    --gc-blur: 15px;
    --gc-opacity: 0.1;
  }
  ha-card {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 12px;
    color: #fff;
    background: rgba(255, 255, 255, var(--gc-opacity)) !important;
    backdrop-filter: blur(var(--gc-blur)) saturate(1.3);
    -webkit-backdrop-filter: blur(var(--gc-blur)) saturate(1.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 28px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  .grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(var(--gc-columns, 2), minmax(0, 1fr));
    /* Lignes de même hauteur qui remplissent le bloc : pas d'espace vide en bas */
    grid-auto-rows: 1fr;
    gap: 10px;
  }
  /* Tuiles carrées : taille fixée par la largeur, jamais étirées en hauteur. */
  /* Au minimum carrées ; si le bloc est étiré (à côté d'une carte plus haute),
     les tuiles s'allongent un peu pour le remplir jusqu'en bas. */
  :host([square]) glass-card {
    aspect-ratio: 1;
    height: auto;
    min-width: 0;
    /* Étirée dans les deux sens : la largeur reste celle de la colonne
       (sinon le ratio élargirait la tuile au-delà du bloc). */
    align-self: stretch;
    justify-self: stretch;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    padding: 2px 6px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const normalizeEntity = (e) => (typeof e === "string" ? { entity: e } : { ...e });

class GlassGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tiles = [];
  }

  static getConfigElement() {
    return document.createElement("glass-grid-card-editor");
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((id) =>
      ["switch", "light", "fan", "input_boolean"].includes(domainOf(id))
    );
    return { entities: ids.slice(0, 4) };
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.entities) || config.entities.length === 0) {
      throw new Error(tr(this._hass, "required_grid"));
    }
    this._config = {
      columns: 2,
      square: true,
      blur: 15,
      opacity: 10,
      show_state: false,
      icon_glow: true,
      ...config,
    };
    this._build();
  }

  set hass(hass) {
    this._hass = hass;
    for (const tile of this._tiles) tile.hass = hass;
  }

  getCardSize() {
    const rows = Math.ceil((this._config?.entities.length || 1) / (this._config?.columns || 2));
    return rows * 2 + 1;
  }

  // Tuiles carrées, hauteur ajustée au contenu.
  getGridOptions() {
    if (this._config?.square === false) return { columns: 12, min_columns: 6 };
    // Largeur choisie pour que les tuiles aient ~la même taille quel que soit le nombre de colonnes.
    const n = Math.max(1, Number(this._config?.columns) || 2);
    const columns = { 1: 4, 2: 8 }[n] || 12;
    return { columns, min_columns: Math.min(columns, 3), rows: "auto" };
  }

  _build() {
    const cfg = this._config;
    this.shadowRoot.innerHTML = `
      <style>${GRID_STYLE}</style>
      <ha-card>${cfg.title ? `<div class="title">${esc(cfg.title)}</div>` : ""}<div class="grid"></div></ha-card>
    `;
    this.style.setProperty("--gc-blur", `${Number(cfg.blur)}px`);
    this.style.setProperty("--gc-opacity", String(Number(cfg.opacity) / 100));
    this.style.setProperty("--gc-columns", String(Math.max(1, Number(cfg.columns) || 2)));
    this.toggleAttribute("square", cfg.square !== false);

    const grid = this.shadowRoot.querySelector(".grid");
    this._tiles = [];
    for (const raw of cfg.entities) {
      const item = normalizeEntity(raw);
      if (!item.entity) continue;
      const tile = document.createElement("glass-card");
      tile.setConfig({
        entity: item.entity,
        name: item.name,
        icon: item.icon,
        icon_on: item.icon_on,
        square: false,
        color: item.color || cfg.color,
        show_state: item.show_state ?? cfg.show_state,
        icon_glow: item.icon_glow ?? cfg.icon_glow,
        // Les tuiles sont déjà sur du verre : pas de second flou, verre plus léger.
        blur: 0,
        opacity: 8,
      });
      if (this._hass) tile.hass = this._hass;
      grid.appendChild(tile);
      this._tiles.push(tile);
    }
  }
}

// Variantes prêtes à l'emploi : une colonne (liste verticale) et trois colonnes.
const gridVariant = (columns) =>
  class extends GlassGridCard {
    static getConfigElement() {
      return document.createElement(`glass-grid-${columns}-card-editor`);
    }
    static getStubConfig(hass) {
      return GlassGridCard.getStubConfig(hass);
    }
    setConfig(config) {
      super.setConfig({ columns, ...config });
    }
  };
const GlassColumnCard = gridVariant(1);
const GlassGrid3Card = gridVariant(3);

/* ---------- Carte thermostat : cadran natif de HA habillé en verre ---------- */

const THERMO_HOST_STYLE = `
  :host {
    display: block;
    height: 100%;
    position: relative;
    --gc-state: 158, 158, 158;
    --gc-backdrop: blur(15px) saturate(1.3);
    --gc-opacity: 0.1;
    --primary-text-color: #fff;
    --secondary-text-color: rgba(255, 255, 255, 0.7);
    --ha-card-background: transparent;
    --card-background-color: transparent;
    --control-select-background: rgba(255, 255, 255, 0.15);
    --feature-border-radius: 16px;
  }
  .wrap {
    height: 100%;
  }
  .wrap > * {
    height: 100%;
  }
  .chip {
    position: absolute;
    top: 12px;
    left: 14px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    background: rgba(var(--gc-state), 0.3);
    border: 1px solid rgba(var(--gc-state), 0.6);
    pointer-events: none;
    --mdc-icon-size: 14px;
    transition: background 0.5s ease, border-color 0.5s ease;
  }
`;

// Injecté dans le shadow DOM de la carte thermostat native.
const THERMO_INNER_CSS = `
  ha-card {
    background: rgba(255, 255, 255, var(--gc-opacity)) !important;
    backdrop-filter: var(--gc-backdrop) !important;
    -webkit-backdrop-filter: var(--gc-backdrop) !important;
    border-radius: 24px !important;
    border: 1px solid rgba(var(--gc-state), 0.6) !important;
    box-shadow: 0 0 24px rgba(var(--gc-state), 0.25) !important;
    color: #fff !important;
    transition: border-color 0.5s ease, box-shadow 0.5s ease;
  }
  .title,
  .name {
    color: #fff !important;
  }
  ha-icon-button {
    color: rgba(255, 255, 255, 0.8) !important;
  }
`;

const THERMO_STATES = {
  off: { rgb: [158, 158, 158], icon: "mdi:power" },
  heating: { rgb: [255, 112, 67], icon: "mdi:fire" },
  cooling: { rgb: [66, 165, 245], icon: "mdi:snowflake" },
  reached: { rgb: [102, 187, 106], icon: "mdi:check-circle" },
  waiting: { rgb: [255, 202, 40], icon: "mdi:timer-sand" },
};

const thermoStatus = (stateObj) => {
  if (!stateObj || ["off", "unavailable", "unknown"].includes(stateObj.state)) return "off";
  const a = stateObj.attributes;
  if (a.hvac_action === "heating" || a.hvac_action === "preheating") return "heating";
  if (a.hvac_action === "cooling") return "cooling";
  const cur = Number(a.current_temperature);
  const tgt = Number(a.temperature);
  if (Number.isFinite(cur) && Number.isFinite(tgt)) {
    if (stateObj.state === "cool" ? cur <= tgt : cur >= tgt) return "reached";
  }
  return "waiting";
};

class GlassThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${THERMO_HOST_STYLE}</style>
      <div class="chip"><ha-icon></ha-icon><span></span></div>
      <div class="wrap"></div>
    `;
    this._chip = this.shadowRoot.querySelector(".chip");
    this._chipIcon = this._chip.querySelector("ha-icon");
    this._chipText = this._chip.querySelector("span");
    this._wrap = this.shadowRoot.querySelector(".wrap");
  }

  static getConfigElement() {
    return document.createElement("glass-thermostat-card-editor");
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((i) => domainOf(i) === "climate");
    return { entity: id || "" };
  }

  setConfig(config) {
    if (!config || domainOf(config.entity) !== "climate") {
      throw new Error(tr(this._hass, "required_climate"));
    }
    this._config = { blur: 15, opacity: 10, show_modes: true, ...config };
    this._inner = null;
    this._innerKey = null;
    this._wrap.textContent = "";
    if (this._hass) this._ensureInner();
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._ensureInner();
    if (this._inner) this._inner.hass = hass;
    this._update();
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, rows: 6, min_columns: 6, min_rows: 5 };
  }

  _innerConfig() {
    const cfg = this._config;
    const stateObj = this._hass?.states[cfg.entity];
    const inner = {
      type: "thermostat",
      entity: cfg.entity,
      show_current_as_primary: true,
    };
    if (cfg.name) inner.name = cfg.name;
    const modes = stateObj?.attributes?.hvac_modes;
    if (cfg.show_modes && Array.isArray(modes) && modes.length) {
      inner.features = [{ type: "climate-hvac-modes", style: "icons", hvac_modes: modes }];
      inner.features_position = "bottom";
    }
    return inner;
  }

  async _ensureInner() {
    if (!this._config || !this._hass) return;
    const innerCfg = this._innerConfig();
    const key = JSON.stringify(innerCfg);
    if (key === this._innerKey) return;
    this._innerKey = key;

    const helpers = await window.loadCardHelpers?.();
    if (!helpers || key !== this._innerKey) return;
    const card = await helpers.createCardElement(innerCfg);
    if (key !== this._innerKey) return;
    card.hass = this._hass;
    this._wrap.textContent = "";
    this._wrap.appendChild(card);
    this._inner = card;
    this._injectStyle(card);
  }

  async _injectStyle(card) {
    // La carte native rend son contenu de façon asynchrone.
    for (let i = 0; i < 50 && !card.shadowRoot; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    await card.updateComplete;
    const root = card.shadowRoot;
    if (!root || root.querySelector("style[data-glass]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-glass", "");
    style.textContent = THERMO_INNER_CSS;
    root.appendChild(style);
  }

  _update() {
    if (!this._config || !this._hass) return;
    const stateObj = this._hass.states[this._config.entity];
    const status = thermoStatus(stateObj);
    const s = THERMO_STATES[status];
    const blur = Number(this._config.blur);
    this.style.setProperty("--gc-state", s.rgb.join(", "));
    this.style.setProperty("--gc-backdrop", blur > 0 ? `blur(${blur}px) saturate(1.3)` : "none");
    this.style.setProperty("--gc-opacity", String(Number(this._config.opacity) / 100));
    this._chipIcon.icon = s.icon;
    this._chipText.textContent = tr(this._hass, `st_${status}`);
  }
}

/* ---------- Outils communs aux cartes « verre » ---------- */

const GLASS_CARD_CSS = `
  :host {
    display: block;
    height: 100%;
    --gc-backdrop: blur(15px) saturate(1.3);
    --gc-opacity: 0.1;
  }
  ha-card {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    isolation: isolate;
    color: #fff;
    background: rgba(255, 255, 255, var(--gc-opacity)) !important;
    backdrop-filter: var(--gc-backdrop);
    -webkit-backdrop-filter: var(--gc-backdrop);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  [hidden] {
    display: none !important;
  }
`;

const applyGlass = (el, cfg) => {
  const blur = Number(cfg.blur ?? 15);
  el.style.setProperty("--gc-backdrop", blur > 0 ? `blur(${blur}px) saturate(1.3)` : "none");
  el.style.setProperty("--gc-opacity", String(Number(cfg.opacity ?? 10) / 100));
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fireEvent = (node, type, detail) =>
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

// Fuseau horaire et format 12/24 h selon le profil HA.
const timeOptions = (hass) => {
  const opts = {};
  const tf = hass?.locale?.time_format;
  if (tf === "12") opts.hour12 = true;
  if (tf === "24") opts.hour12 = false;
  if (hass?.locale?.time_zone === "server" && hass?.config?.time_zone) opts.timeZone = hass.config.time_zone;
  return opts;
};
const langOf = (hass) => hass?.locale?.language || hass?.language || navigator.language || "fr";

/* ---------- Carte horloge ---------- */

// Calendrier français des fêtes (prénoms), un tableau par mois.
const SAINTS = [
  ["Jour de l'An", "Basile", "Geneviève", "Odilon", "Édouard", "Mélaine", "Raymond", "Lucien", "Alix", "Guillaume", "Paulin", "Tatiana", "Yvette", "Nina", "Rémi", "Marcel", "Roseline", "Prisca", "Marius", "Sébastien", "Agnès", "Vincent", "Barnard", "François de Sales", "Conversion de Paul", "Paule", "Angèle", "Thomas d'Aquin", "Gildas", "Martine", "Marcelle"],
  ["Ella", "Présentation du Seigneur", "Blaise", "Véronique", "Agathe", "Gaston", "Eugénie", "Jacqueline", "Apolline", "Arnaud", "Notre-Dame de Lourdes", "Félix", "Béatrice", "Valentin", "Claude", "Julienne", "Alexis", "Bernadette", "Gabin", "Aimée", "Pierre Damien", "Isabelle", "Lazare", "Modeste", "Roméo", "Nestor", "Honorine", "Romain", "Auguste"],
  ["Aubin", "Charles le Bon", "Guénolé", "Casimir", "Olive", "Colette", "Félicité", "Jean de Dieu", "Françoise", "Vivien", "Rosine", "Justine", "Rodrigue", "Mathilde", "Louise", "Bénédicte", "Patrice", "Cyrille", "Joseph", "Herbert", "Clémence", "Léa", "Victorien", "Catherine de Suède", "Annonciation", "Larissa", "Habib", "Gontran", "Gwladys", "Amédée", "Benjamin"],
  ["Hugues", "Sandrine", "Richard", "Isidore", "Irène", "Marcellin", "Jean-Baptiste de la Salle", "Julie", "Gautier", "Fulbert", "Stanislas", "Jules", "Ida", "Maxime", "Paterne", "Benoît-Joseph", "Anicet", "Parfait", "Emma", "Odette", "Anselme", "Alexandre", "Georges", "Fidèle", "Marc", "Alida", "Zita", "Valérie", "Catherine de Sienne", "Robert"],
  ["Fête du Travail", "Boris", "Philippe et Jacques", "Sylvain", "Judith", "Prudence", "Gisèle", "Désiré", "Pacôme", "Solange", "Estelle", "Achille", "Rolande", "Matthias", "Denise", "Honoré", "Pascal", "Éric", "Yves", "Bernardin", "Constantin", "Émile", "Didier", "Donatien", "Sophie", "Bérenger", "Augustin de Cantorbéry", "Germain", "Aymar", "Ferdinand", "Visitation"],
  ["Justin", "Blandine", "Kévin", "Clotilde", "Igor", "Norbert", "Gilbert", "Médard", "Diane", "Landry", "Barnabé", "Guy", "Antoine de Padoue", "Élisée", "Germaine", "Jean-François Régis", "Hervé", "Léonce", "Romuald", "Silvère", "Rodolphe", "Alban", "Audrey", "Jean-Baptiste", "Prosper", "Anthelme", "Fernand", "Irénée", "Pierre et Paul", "Martial"],
  ["Thierry", "Martinien", "Thomas", "Florent", "Antoine", "Mariette", "Raoul", "Thibaut", "Amandine", "Ulrich", "Benoît", "Olivier", "Henri et Joël", "Fête nationale", "Donald", "Notre-Dame du Mont Carmel", "Charlotte", "Frédéric", "Arsène", "Marina", "Victor", "Marie-Madeleine", "Brigitte", "Christine", "Jacques", "Anne et Joachim", "Nathalie", "Samson", "Marthe", "Juliette", "Ignace de Loyola"],
  ["Alphonse", "Julien Eymard", "Lydie", "Jean-Marie Vianney", "Abel", "Transfiguration", "Gaétan", "Dominique", "Amour", "Laurent", "Claire", "Clarisse", "Hippolyte", "Evrard", "Assomption", "Armel", "Hyacinthe", "Hélène", "Jean Eudes", "Bernard", "Christophe", "Fabrice", "Rose de Lima", "Barthélemy", "Louis", "Natacha", "Monique", "Augustin", "Sabine", "Fiacre", "Aristide"],
  ["Gilles", "Ingrid", "Grégoire", "Rosalie", "Raïssa", "Bertrand", "Reine", "Nativité de Marie", "Alain", "Inès", "Adelphe", "Apollinaire", "Aimé", "Croix Glorieuse", "Roland", "Édith", "Renaud", "Nadège", "Émilie", "Davy", "Matthieu", "Maurice", "Constant", "Thècle", "Hermann", "Côme et Damien", "Vincent de Paul", "Venceslas", "Michel, Gabriel et Raphaël", "Jérôme"],
  ["Thérèse de l'Enfant-Jésus", "Léger", "Gérard", "François d'Assise", "Fleur", "Bruno", "Serge", "Pélagie", "Denis", "Ghislain", "Firmin", "Wilfried", "Géraud", "Juste", "Thérèse d'Avila", "Edwige", "Baudouin", "Luc", "René", "Adeline", "Céline", "Élodie", "Jean de Capistran", "Florentin", "Crépin", "Dimitri", "Émeline", "Simon et Jude", "Narcisse", "Bienvenue", "Quentin"],
  ["Toussaint", "Défunts", "Hubert", "Charles", "Sylvie", "Bertille", "Carine", "Geoffroy", "Théodore", "Léon", "Martin", "Christian", "Brice", "Sidoine", "Albert", "Marguerite", "Élisabeth", "Aude", "Tanguy", "Edmond", "Présentation de Marie", "Cécile", "Clément", "Flora", "Catherine", "Delphine", "Séverin", "Jacques de la Marche", "Saturnin", "André"],
  ["Florence", "Viviane", "François-Xavier", "Barbara", "Gérald", "Nicolas", "Ambroise", "Immaculée Conception", "Pierre Fourier", "Romaric", "Daniel", "Jeanne-Françoise de Chantal", "Lucie", "Odile", "Ninon", "Alice", "Gaël", "Gatien", "Urbain", "Théophile", "Pierre Canisius", "Françoise-Xavière", "Armand", "Adèle", "Noël", "Étienne", "Jean", "Innocents", "David", "Roger", "Sylvestre"],
];

const CLOCK_STYLE = `
  ${GLASS_CARD_CSS}
  ha-card {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0;
  }
  .time {
    font-size: 38px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
  }
  .sec {
    font-size: 19px;
    font-weight: 400;
    opacity: 0.6;
    margin-left: 2px;
  }
  .date {
    font-size: 17px;
    line-height: 1.25;
    font-weight: 600;
  }
  .saint {
    margin-top: 2px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
  }
`;

class GlassClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${CLOCK_STYLE}</style>
      <ha-card>
        <div class="time"></div>
        <div class="date"></div>
        <div class="saint"></div>
      </ha-card>
    `;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._time = $(".time");
    this._date = $(".date");
    this._saint = $(".saint");
  }

  static getConfigElement() {
    return document.createElement("glass-clock-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = {
      show_seconds: false,
      show_weekday: true,
      show_date: true,
      show_year: false,
      show_saint: true,
      blur: 15,
      opacity: 10,
      ...config,
    };
    applyGlass(this, this._config);
    this._last = null;
    this._tick();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._last = null;
      this._tick();
    }
  }

  connectedCallback() {
    this._tick();
    this._timer = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 4, rows: "auto" };
  }

  _tick() {
    if (!this._config) return;
    const cfg = this._config;
    const now = new Date();
    const lang = langOf(this._hass);
    const base = timeOptions(this._hass);

    const timeStr = new Intl.DateTimeFormat(lang, { ...base, hour: "2-digit", minute: "2-digit" }).format(now);
    const secStr = cfg.show_seconds
      ? new Intl.DateTimeFormat(lang, { ...base, second: "2-digit" }).format(now).padStart(2, "0")
      : "";

    const dateOpts = { timeZone: base.timeZone };
    if (cfg.show_weekday) dateOpts.weekday = "long";
    if (cfg.show_date) Object.assign(dateOpts, { day: "numeric", month: "long" });
    if (cfg.show_date && cfg.show_year) dateOpts.year = "numeric";
    const hasDate = cfg.show_weekday || cfg.show_date;
    const dateStr = hasDate ? new Intl.DateTimeFormat(lang, dateOpts).format(now) : "";

    // Jour et mois dans le fuseau affiché, pour la fête du jour.
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: base.timeZone, month: "numeric", day: "numeric" })
      .formatToParts(now)
      .reduce((acc, p) => ((acc[p.type] = p.value), acc), {});
    const saint = SAINTS[Number(parts.month) - 1]?.[Number(parts.day) - 1] || "";

    const key = [timeStr, secStr, dateStr, saint, cfg.show_saint].join("|");
    if (key === this._last) return;
    this._last = key;

    this._time.textContent = timeStr;
    if (secStr) {
      const s = document.createElement("span");
      s.className = "sec";
      s.textContent = `:${secStr}`;
      this._time.append(s);
    }
    this._date.hidden = !hasDate;
    this._date.textContent = dateStr;
    this._saint.hidden = !cfg.show_saint || !saint;
    this._saint.textContent = `${tr(this._hass, "saint_prefix")} ${saint}`;
  }
}

/* ---------- Carte lecteur média ---------- */

const MP = { PAUSE: 1, VOLUME_SET: 4, VOLUME_MUTE: 8, PREVIOUS: 16, NEXT: 32, TURN_ON: 128, TURN_OFF: 256, PLAY: 16384 };

const MEDIA_STYLE = `
  ${GLASS_CARD_CSS}
  ha-card {
    padding: 16px;
  }
  .bg,
  .art {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .bg {
    inset: -40px;
    filter: blur(35px) saturate(1.6) brightness(0.65);
  }
  .art {
    top: 0;
    right: 0;
    bottom: 0;
    width: 45%;
    -webkit-mask-image: linear-gradient(to right, transparent, black 70%);
    mask-image: linear-gradient(to right, transparent, black 70%);
  }
  ha-card.has-art .bg {
    opacity: 1;
  }
  ha-card.has-art .art {
    opacity: 0.85;
  }
  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button {
    border: none;
    background: none;
    color: #fff;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    border-radius: 50%;
    transition: transform 0.15s ease, background 0.2s ease;
  }
  button:active {
    transform: scale(0.9);
  }
  .round {
    width: 40px;
    height: 40px;
    flex: none;
    background: rgba(255, 255, 255, 0.15);
    --mdc-icon-size: 20px;
  }
  .vol {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .slider {
    position: relative;
    flex: 1;
    height: 44px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    touch-action: none;
  }
  .fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0;
    background: #fff;
    transition: width 0.15s ease;
  }
  .slider.dragging .fill {
    transition: none;
  }
  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 28px;
  }
  .controls button {
    width: 48px;
    height: 48px;
    --mdc-icon-size: 30px;
  }
  .controls .play {
    --mdc-icon-size: 36px;
  }
`;

class GlassMediaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${MEDIA_STYLE}</style>
      <ha-card>
        <div class="bg"></div>
        <div class="art"></div>
        <div class="content">
          <div class="head">
            <div class="info"><div class="title"></div><div class="sub"></div></div>
            <button class="round power" aria-label="Power"><ha-icon icon="mdi:power"></ha-icon></button>
          </div>
          <div class="vol">
            <button class="round mute" aria-label="Mute"><ha-icon></ha-icon></button>
            <div class="slider" role="slider" aria-valuemin="0" aria-valuemax="100"><div class="fill"></div></div>
          </div>
          <div class="controls">
            <button class="prev" aria-label="Previous"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <button class="play" aria-label="Play/Pause"><ha-icon></ha-icon></button>
            <button class="next" aria-label="Next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        </div>
      </ha-card>
    `;
    const $ = (s) => this.shadowRoot.querySelector(s);
    Object.assign(this, {
      _card: $("ha-card"),
      _bg: $(".bg"),
      _art: $(".art"),
      _head: $(".head"),
      _title: $(".title"),
      _sub: $(".sub"),
      _power: $(".power"),
      _volRow: $(".vol"),
      _mute: $(".mute"),
      _muteIcon: $(".mute ha-icon"),
      _slider: $(".slider"),
      _fill: $(".fill"),
      _controls: $(".controls"),
      _prev: $(".prev"),
      _play: $(".play"),
      _playIcon: $(".play ha-icon"),
      _next: $(".next"),
    });

    this._head.addEventListener("click", (e) => {
      if (!e.composedPath().includes(this._power)) fireEvent(this, "hass-more-info", { entityId: this._config.entity });
    });
    this._power.addEventListener("click", () => this._call("toggle"));
    this._mute.addEventListener("click", () =>
      this._call("volume_mute", { is_volume_muted: !this._stateObj?.attributes?.is_volume_muted })
    );
    this._prev.addEventListener("click", () => this._call("media_previous_track"));
    this._play.addEventListener("click", () => this._call("media_play_pause"));
    this._next.addEventListener("click", () => this._call("media_next_track"));

    // Barre de volume : glisser pour régler, envoi limité pendant le geste.
    const ratioAt = (e) => {
      const r = this._slider.getBoundingClientRect();
      return r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0;
    };
    this._slider.addEventListener("pointerdown", (e) => {
      this._dragging = true;
      this._slider.classList.add("dragging");
      this._slider.setPointerCapture?.(e.pointerId);
      this._setVolume(ratioAt(e), false);
    });
    this._slider.addEventListener("pointermove", (e) => {
      if (this._dragging) this._setVolume(ratioAt(e), false);
    });
    const end = (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      this._slider.classList.remove("dragging");
      this._setVolume(ratioAt(e), true);
    };
    this._slider.addEventListener("pointerup", end);
    this._slider.addEventListener("pointercancel", end);
  }

  static getConfigElement() {
    return document.createElement("glass-media-card-editor");
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((i) => domainOf(i) === "media_player");
    return { entity: id || "" };
  }

  setConfig(config) {
    if (!config || domainOf(config.entity) !== "media_player") {
      throw new Error(tr(this._hass, "required_media"));
    }
    this._config = {
      show_artwork: true,
      show_volume: true,
      show_controls: true,
      show_power: true,
      blur: 15,
      opacity: 5,
      ...config,
    };
    applyGlass(this, this._config);
    this._update();
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    const id = this._config?.entity;
    if (!prev || !id || prev.states[id] !== hass.states[id] || prev.language !== hass.language) this._update();
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  get _stateObj() {
    return this._hass?.states[this._config?.entity];
  }

  _call(service, data = {}) {
    this._hass.callService("media_player", service, { entity_id: this._config.entity, ...data });
  }

  _setVolume(ratio, final) {
    this._pendingVolume = ratio;
    this._fill.style.width = `${ratio * 100}%`;
    this._renderSub();
    const now = Date.now();
    if (final || !this._lastSent || now - this._lastSent > 250) {
      this._lastSent = now;
      this._call("volume_set", { volume_level: Math.round(ratio * 100) / 100 });
    }
    if (final) {
      // On garde la valeur locale le temps que HA confirme, pour éviter un saut en arrière.
      clearTimeout(this._pendingTimer);
      this._pendingTimer = setTimeout(() => {
        this._pendingVolume = undefined;
        this._update();
      }, 1500);
    }
  }

  _volume() {
    if (this._pendingVolume !== undefined) return this._pendingVolume;
    const v = this._stateObj?.attributes?.volume_level;
    return typeof v === "number" ? v : undefined;
  }

  _renderSub() {
    const s = this._stateObj;
    if (!s) return;
    const off = ["off", "unavailable", "unknown", "standby"].includes(s.state);
    const artist = s.attributes.media_artist;
    let text = off || !artist ? this._formatState(s) : artist;
    const v = this._volume();
    if (!off && v !== undefined) text += ` · ${Math.round(v * 100)} %`;
    this._sub.textContent = text;
  }

  _formatState(s) {
    try {
      if (typeof this._hass.formatEntityState === "function") return this._hass.formatEntityState(s);
    } catch (e) {
      /* fallback */
    }
    return s.state;
  }

  _update() {
    if (!this._config || !this._hass) return;
    const cfg = this._config;
    const s = this._stateObj;
    if (!s) {
      this._title.textContent = cfg.name || cfg.entity;
      this._sub.textContent = tr(this._hass, "unavailable");
      this._volRow.hidden = this._controls.hidden = this._power.hidden = true;
      this._card.classList.remove("has-art");
      return;
    }
    const a = s.attributes;
    const f = a.supported_features || 0;
    const off = ["off", "unavailable", "unknown", "standby"].includes(s.state);
    const playing = ["playing", "paused", "buffering"].includes(s.state);

    this._title.textContent = (playing && a.media_title) || cfg.name || a.friendly_name || cfg.entity;
    this._renderSub();

    this._power.hidden = !cfg.show_power || !(f & (MP.TURN_ON | MP.TURN_OFF));

    this._volRow.hidden = !cfg.show_volume || off || !(f & MP.VOLUME_SET);
    this._mute.hidden = !(f & MP.VOLUME_MUTE);
    this._muteIcon.icon = a.is_volume_muted ? "mdi:volume-off" : "mdi:volume-high";
    if (!this._dragging) {
      const v = this._volume();
      this._fill.style.width = `${(v ?? 0) * 100}%`;
      this._slider.setAttribute("aria-valuenow", String(Math.round((v ?? 0) * 100)));
    }

    const canPlay = f & (MP.PLAY | MP.PAUSE);
    this._controls.hidden = !cfg.show_controls || off || !(canPlay || f & (MP.PREVIOUS | MP.NEXT));
    this._prev.hidden = !(f & MP.PREVIOUS);
    this._next.hidden = !(f & MP.NEXT);
    this._play.hidden = !canPlay;
    this._playIcon.icon = s.state === "playing" ? "mdi:pause" : "mdi:play";

    const pic = cfg.show_artwork && playing ? a.entity_picture_local || a.entity_picture : null;
    if (pic) {
      const url = `url("${String(pic).replace(/"/g, "%22")}")`;
      this._bg.style.backgroundImage = url;
      this._art.style.backgroundImage = url;
    }
    this._card.classList.toggle("has-art", Boolean(pic));
  }
}

/* ---------- Carte météo ---------- */

const WEATHER_ICONS = {
  "clear-night": ["mdi:weather-night", "#e5e5ea"],
  cloudy: ["mdi:weather-cloudy", "#d1d1d6"],
  exceptional: ["mdi:alert-circle-outline", "#ff9f0a"],
  fog: ["mdi:weather-fog", "#d1d1d6"],
  hail: ["mdi:weather-hail", "#bfe9ff"],
  lightning: ["mdi:weather-lightning", "#ffd60a"],
  "lightning-rainy": ["mdi:weather-lightning-rainy", "#ffd60a"],
  partlycloudy: ["mdi:weather-partly-cloudy", "#ffe680"],
  pouring: ["mdi:weather-pouring", "#64d2ff"],
  rainy: ["mdi:weather-rainy", "#64d2ff"],
  snowy: ["mdi:weather-snowy", "#ffffff"],
  "snowy-rainy": ["mdi:weather-snowy-rainy", "#bfe9ff"],
  sunny: ["mdi:weather-sunny", "#ffd60a"],
  windy: ["mdi:weather-windy", "#d1d1d6"],
  "windy-variant": ["mdi:weather-windy-variant", "#d1d1d6"],
};
const weatherIcon = (cond) => WEATHER_ICONS[cond] || ["mdi:weather-cloudy", "#d1d1d6"];

const COMPASS = {
  fr: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"],
  en: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
};

const WEATHER_STYLE = `
  ${GLASS_CARD_CSS}
  ha-card {
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    cursor: default;
  }
  .now {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
  }
  .temp {
    font-size: 56px;
    font-weight: 200;
    line-height: 1;
    letter-spacing: -2px;
  }
  .cond {
    margin-top: 6px;
    font-size: 15px;
    font-weight: 600;
  }
  .hilo {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 2px;
  }
  .big-icon {
    --mdc-icon-size: 64px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
  }
  .details {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 12px;
    --mdc-icon-size: 16px;
  }
  .chip span {
    opacity: 0.7;
  }
  .section {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 14px;
  }
  .hourly {
    display: grid;
    grid-template-columns: repeat(var(--gc-hours, 6), minmax(0, 1fr));
    gap: 4px;
    text-align: center;
  }
  .h-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
  .h-icon {
    --mdc-icon-size: 26px;
    margin: 6px 0;
  }
  .h-temp {
    font-size: 15px;
    font-weight: 600;
  }
  .h-rain {
    font-size: 11px;
    color: #64d2ff;
    min-height: 14px;
  }
  .daily {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .day {
    display: grid;
    grid-template-columns: 56px 28px 36px 1fr 36px;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  .d-name {
    font-weight: 600;
    text-transform: capitalize;
  }
  .d-icon {
    --mdc-icon-size: 22px;
  }
  .d-min {
    text-align: right;
    color: rgba(255, 255, 255, 0.6);
  }
  .d-max {
    font-weight: 600;
  }
  .bar {
    position: relative;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.15);
  }
  .bar i {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 3px;
    background: linear-gradient(90deg, #64d2ff, #a8e05f, #ffd60a, #ff9f0a);
    background-size: var(--gc-span, 100%) 100%;
    background-position: var(--gc-pos, 0) 0;
  }
`;

class GlassWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${WEATHER_STYLE}</style><ha-card></ha-card>`;
    this._card = this.shadowRoot.querySelector("ha-card");
    this._card.addEventListener("click", (e) => {
      if (e.composedPath().some((n) => n.classList?.contains("now"))) {
        fireEvent(this, "hass-more-info", { entityId: this._config.entity });
      }
    });
    this._forecast = {};
  }

  static getConfigElement() {
    return document.createElement("glass-weather-card-editor");
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((i) => domainOf(i) === "weather");
    return { entity: id || "" };
  }

  setConfig(config) {
    if (!config || domainOf(config.entity) !== "weather") {
      throw new Error(tr(this._hass, "required_weather"));
    }
    const prevEntity = this._config?.entity;
    this._config = {
      show_details: true,
      show_hourly: true,
      show_daily: true,
      hours: 6,
      days: 5,
      blur: 15,
      opacity: 10,
      ...config,
    };
    applyGlass(this, this._config);
    if (prevEntity !== this._config.entity) this._forecast = {};
    this._unsubscribe();
    this._subscribe();
    this._render();
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    this._subscribe();
    const id = this._config?.entity;
    if (!prev || !id || prev.states[id] !== hass.states[id] || prev.language !== hass.language) this._render();
  }

  connectedCallback() {
    this._subscribe();
  }

  disconnectedCallback() {
    this._unsubscribe();
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  // Les prévisions ne sont plus dans les attributs depuis HA 2024 : on s'y abonne.
  _subscribe() {
    if (this._subs || !this._hass?.connection || !this._config || !this.isConnected) return;
    this._subs = [];
    const types = [];
    if (this._config.show_hourly) types.push("hourly");
    if (this._config.show_daily) types.push("daily");
    for (const type of types) {
      const p = this._hass.connection
        .subscribeMessage(
          (msg) => {
            this._forecast[type] = msg.forecast || [];
            this._render();
          },
          { type: "weather/subscribe_forecast", forecast_type: type, entity_id: this._config.entity }
        )
        .catch(() => {
          this._forecast[type] = null; // type de prévision non fourni par l'intégration
          return null;
        });
      this._subs.push(p);
    }
  }

  _unsubscribe() {
    if (!this._subs) return;
    for (const p of this._subs) p.then((unsub) => typeof unsub === "function" && unsub()).catch(() => {});
    this._subs = null;
  }

  _fmtTemp(v) {
    return Number.isFinite(Number(v)) ? `${Math.round(Number(v))}°` : "–";
  }

  _render() {
    if (!this._config || !this._hass) return;
    const cfg = this._config;
    const s = this._hass.states[cfg.entity];
    if (!s) {
      this._card.innerHTML = `<div class="cond">${esc(tr(this._hass, "unavailable"))}</div>`;
      return;
    }
    const a = s.attributes;
    const lang = langOf(this._hass);
    const short = lang.slice(0, 2);
    const base = timeOptions(this._hass);
    const [icon, color] = weatherIcon(s.state);
    let condText = s.state;
    try {
      condText = this._hass.formatEntityState?.(s) || s.state;
    } catch (e) {
      /* garde l'état brut */
    }

    const daily = this._forecast.daily || [];
    const today = daily[0];
    const hilo =
      today && today.temperature !== undefined
        ? `↑ ${this._fmtTemp(today.temperature)}${today.templow !== undefined ? `  ↓ ${this._fmtTemp(today.templow)}` : ""}`
        : "";

    let html = `
      <div class="now">
        <div>
          <div class="temp">${esc(this._fmtTemp(a.temperature))}</div>
          <div class="cond">${esc(cfg.name ? `${cfg.name} · ${condText}` : condText)}</div>
          ${hilo ? `<div class="hilo">${esc(hilo)}</div>` : ""}
        </div>
        <ha-icon class="big-icon" icon="${icon}" style="color:${color}"></ha-icon>
      </div>`;

    if (cfg.show_details) {
      const chips = [];
      if (a.apparent_temperature !== undefined) {
        chips.push(["mdi:thermometer", tr(this._hass, "feels_like"), this._fmtTemp(a.apparent_temperature)]);
      }
      if (a.humidity !== undefined) chips.push(["mdi:water-percent", tr(this._hass, "humidity"), `${Math.round(a.humidity)} %`]);
      if (a.wind_speed !== undefined) {
        let dir = a.wind_bearing;
        if (typeof dir === "number") dir = (COMPASS[short] || COMPASS.en)[Math.round(dir / 22.5) % 16];
        chips.push([
          "mdi:weather-windy",
          tr(this._hass, "wind"),
          `${dir ? dir + " " : ""}${Math.round(a.wind_speed)} ${a.wind_speed_unit || ""}`.trim(),
        ]);
      }
      if (chips.length) {
        html += `<div class="details">${chips
          .map(([i, l, v]) => `<div class="chip"><ha-icon icon="${i}"></ha-icon><span>${esc(l)}</span>${esc(v)}</div>`)
          .join("")}</div>`;
      }
    }

    const hourly = (this._forecast.hourly || []).slice(0, Math.max(1, Number(cfg.hours) || 6));
    if (cfg.show_hourly && hourly.length) {
      const fmt = new Intl.DateTimeFormat(lang, { ...base, hour: "2-digit", minute: "2-digit" });
      html += `<div class="section"><div class="hourly" style="--gc-hours:${hourly.length}">${hourly
        .map((h, i) => {
          const [hi, hc] = weatherIcon(h.condition);
          const rain = Number(h.precipitation_probability);
          return `<div>
            <div class="h-time">${esc(i === 0 ? tr(this._hass, "now") : fmt.format(new Date(h.datetime)))}</div>
            <ha-icon class="h-icon" icon="${hi}" style="color:${hc}"></ha-icon>
            <div class="h-temp">${esc(this._fmtTemp(h.temperature))}</div>
            <div class="h-rain">${rain > 0 ? `${Math.round(rain)} %` : ""}</div>
          </div>`;
        })
        .join("")}</div></div>`;
    }

    const days = daily.slice(0, Math.max(1, Number(cfg.days) || 5));
    if (cfg.show_daily && days.length) {
      const lows = days.map((d) => Number(d.templow ?? d.temperature));
      const highs = days.map((d) => Number(d.temperature));
      const min = Math.min(...lows);
      const max = Math.max(...highs);
      const range = max - min || 1;
      const fmt = new Intl.DateTimeFormat(lang, { timeZone: base.timeZone, weekday: "short" });
      html += `<div class="section"><div class="daily">${days
        .map((d, i) => {
          const [di, dc] = weatherIcon(d.condition);
          const lo = Number(d.templow ?? d.temperature);
          const hi = Number(d.temperature);
          const left = ((lo - min) / range) * 100;
          const width = Math.max(4, ((hi - lo) / range) * 100);
          // Le dégradé est calé sur toute la semaine : une journée chaude est plus orange.
          const span = (100 / width) * 100;
          const pos = width >= 100 ? 0 : (left / (100 - width)) * 100;
          return `<div class="day">
            <div class="d-name">${esc(i === 0 ? tr(this._hass, "today") : fmt.format(new Date(d.datetime)).replace(".", ""))}</div>
            <ha-icon class="d-icon" icon="${di}" style="color:${dc}"></ha-icon>
            <div class="d-min">${esc(this._fmtTemp(lo))}</div>
            <div class="bar"><i style="left:${left}%;width:${width}%;--gc-span:${span}%;--gc-pos:${pos}%"></i></div>
            <div class="d-max">${esc(this._fmtTemp(hi))}</div>
          </div>`;
        })
        .join("")}</div></div>`;
    }

    this._card.innerHTML = html;
  }
}

/* ---------- Carte membres (présence) ---------- */

const MEMBERS_STYLE = `
  ${GLASS_CARD_CSS}
  ha-card {
    padding: 12px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .title {
    font-size: 14px;
    font-weight: 600;
  }
  .count {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    font-variant-numeric: tabular-nums;
  }
  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .m {
    position: relative;
    width: 34px;
    height: 34px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .pic {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15) center / cover no-repeat;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    transition: opacity 0.3s, filter 0.3s;
  }
  .m.away .pic {
    opacity: 0.45;
    filter: grayscale(100%);
  }
  .dot {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-sizing: border-box;
    background: #34c759;
    transition: background 0.3s;
  }
  .m.away .dot {
    background: rgba(150, 150, 150, 0.9);
  }
`;

class GlassMembersCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${MEMBERS_STYLE}</style>
      <ha-card>
        <div class="head"><span class="title"></span><span class="count"></span></div>
        <div class="avatars"></div>
      </ha-card>
    `;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._title = $(".title");
    this._count = $(".count");
    this._avatars = $(".avatars");
    this._avatars.addEventListener("click", (ev) => {
      const m = ev.target.closest(".m");
      if (m) fireEvent(this, "hass-more-info", { entityId: m.dataset.entity });
    });
  }

  static getConfigElement() {
    return document.createElement("glass-members-card-editor");
  }

  static getStubConfig(hass) {
    const people = Object.keys(hass?.states || {}).filter((id) => domainOf(id) === "person");
    return { entities: people.length ? people : ["person.example"] };
  }

  setConfig(config) {
    if (!Array.isArray(config?.entities) || !config.entities.length) {
      throw new Error(tr(this._hass, "required_people"));
    }
    this._config = { show_count: true, blur: 15, opacity: 10, ...config };
    this._members = config.entities.map(normalizeEntity);
    applyGlass(this, this._config);
    this._last = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 3, rows: "auto" };
  }

  _render() {
    if (!this._config || !this._hass) return;
    const states = this._hass.states;
    const list = this._members.map((m) => {
      const st = states[m.entity];
      return {
        entity: m.entity,
        home: st?.state === "home",
        name: m.name || st?.attributes?.friendly_name || m.entity,
        picture: st?.attributes?.entity_picture || "",
      };
    });
    const key = JSON.stringify([list, this._config.title, this._config.show_count]);
    if (key === this._last) return;
    this._last = key;

    const home = list.filter((m) => m.home).length;
    this._title.textContent = this._config.title ?? tr(this._hass, "members");
    this._count.hidden = !this._config.show_count;
    this._count.textContent = `${home}/${list.length}`;
    this._avatars.innerHTML = list
      .map(
        (m) => `
        <div class="m ${m.home ? "home" : "away"}" data-entity="${esc(m.entity)}" title="${esc(m.name)}">
          <div class="pic" ${m.picture ? `style="background-image:url('${esc(m.picture)}')"` : ""}>${
            m.picture ? "" : esc(m.name.charAt(0).toUpperCase())
          }</div>
          <div class="dot"></div>
        </div>`
      )
      .join("");
  }
}

// Même chose en badge (rangée du haut d'une vue « sections ») : taille au contenu.
class GlassMembersBadge extends GlassMembersCard {
  constructor() {
    super();
    const st = document.createElement("style");
    st.textContent = `
      :host { display: inline-block; height: auto; vertical-align: top; }
      ha-card { height: auto; padding: 10px 14px 12px; gap: 8px; min-width: 120px; }
      .avatars { flex-wrap: nowrap; }
    `;
    this.shadowRoot.append(st);
  }
  static getConfigElement() {
    return document.createElement("glass-members-card-editor");
  }
}

/* ---------- Éditeurs visuels ---------- */

const bool = (name) => ({ name, selector: { boolean: {} } });
const pairOf = (...items) => ({ type: "grid", name: "", schema: items });

const APPEARANCE_SCHEMA = [
  { name: "color", selector: { color_rgb: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "blur", selector: { number: { min: 0, max: 40, step: 1, mode: "slider", unit_of_measurement: "px" } } },
      { name: "opacity", selector: { number: { min: 0, max: 50, step: 1, mode: "slider", unit_of_measurement: "%" } } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "icon_glow", selector: { boolean: {} } },
      { name: "show_state", selector: { boolean: {} } },
    ],
  },
];

const CARD_SCHEMA = [
  { name: "entity", required: true, selector: { entity: {} } },
  { name: "name", selector: { text: {} } },
  { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
  { name: "icon_on", selector: { icon: {} }, context: { icon_entity: "entity" } },
  { name: "square", selector: { boolean: {} } },
  ...APPEARANCE_SCHEMA,
];

const GRID_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "entities", required: true, selector: { entity: { multiple: true } } },
  pairOf(
    { name: "columns", selector: { number: { min: 1, max: 4, step: 1, mode: "box" } } },
    { name: "square", selector: { boolean: {} } }
  ),
  ...APPEARANCE_SCHEMA,
];

class GlassBaseEditor extends HTMLElement {
  get _schema() {
    return [];
  }
  get _defaults() {
    return {};
  }
  // Conversion config → données du formulaire, et inversement.
  _toForm(config) {
    return config;
  }
  _fromForm(value) {
    return value;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    this._ensureHaForm().then(() => this._render());
  }

  // ha-form n'est chargé par HA qu'à l'ouverture d'un éditeur natif : on force son chargement.
  async _ensureHaForm() {
    if (customElements.get("ha-form")) return;
    try {
      const helpers = await window.loadCardHelpers?.();
      const card = await helpers?.createCardElement({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    } catch (e) {
      /* ignoré */
    }
  }

  _render() {
    if (!this._hass || !this._config || !customElements.get("ha-form")) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = this._fromForm({ ...ev.detail.value });
        for (const k of Object.keys(config)) {
          if (config[k] === "" || config[k] === null || config[k] === undefined) delete config[k];
        }
        // Couleur par défaut affichée dans le formulaire : on ne l'écrit pas dans la config
        // (sinon elle écraserait la couleur réelle des lumières).
        if (Array.isArray(config.color) && config.color.join() === DEFAULT_ACCENT.join()) {
          delete config.color;
        }
        this._config = config;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })
        );
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = { ...this._defaults, ...this._toForm(this._config) };
    this._form.schema = this._schema;
    this._form.computeLabel = (s) => s.title || tr(this._hass, s.name);
  }
}

class GlassCardEditor extends GlassBaseEditor {
  get _schema() {
    return CARD_SCHEMA;
  }
  get _defaults() {
    return { blur: 15, opacity: 10, show_state: true, icon_glow: true, square: true, color: DEFAULT_ACCENT };
  }
}

const OV = "ov:"; // préfixe des volets « par entité » dans le formulaire

class GlassGridCardEditor extends GlassBaseEditor {
  get _ids() {
    return (this._config?.entities || []).map((e) => normalizeEntity(e).entity).filter(Boolean);
  }

  // Liste d'entités, puis un volet dépliable (nom + icône) par entité.
  get _schema() {
    const perEntity = this._ids.map((id) => {
      const stateObj = this._hass?.states[id];
      const iconSelector = stateObj?.attributes?.icon ? { placeholder: stateObj.attributes.icon } : {};
      return {
        type: "expandable",
        name: OV + id,
        title: stateObj?.attributes?.friendly_name || id,
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: iconSelector } },
          { name: "icon_on", selector: { icon: iconSelector } },
        ],
      };
    });
    return [GRID_SCHEMA[0], GRID_SCHEMA[1], ...perEntity, ...GRID_SCHEMA.slice(2)];
  }

  get _defaults() {
    return { columns: 2, square: true, blur: 15, opacity: 10, show_state: false, icon_glow: true, color: DEFAULT_ACCENT };
  }

  _toForm(config) {
    const data = { ...config, entities: [] };
    for (const raw of config.entities || []) {
      const item = normalizeEntity(raw);
      if (!item.entity) continue;
      data.entities.push(item.entity);
      data[OV + item.entity] = { name: item.name, icon: item.icon, icon_on: item.icon_on };
    }
    return data;
  }

  // Reconstruit la liste : id seul, ou objet si un nom / une icône est personnalisé.
  // Les autres réglages par entité écrits en YAML (color…) sont conservés.
  _fromForm(value) {
    const previous = new Map(
      (this._config?.entities || []).map((e) => [normalizeEntity(e).entity, normalizeEntity(e)])
    );
    const entities = (value.entities || []).map((id) => {
      const item = { ...(previous.get(id) || { entity: id }) };
      if (OV + id in value) {
        const ov = value[OV + id] || {};
        item.name = ov.name;
        item.icon = ov.icon;
        item.icon_on = ov.icon_on;
      }
      for (const k of Object.keys(item)) {
        if (item[k] === "" || item[k] === null || item[k] === undefined) delete item[k];
      }
      return Object.keys(item).length === 1 ? id : item;
    });
    const config = { ...value, entities };
    for (const k of Object.keys(config)) if (k.startsWith(OV)) delete config[k];
    return config;
  }
}

const gridEditorVariant = (columns) =>
  class extends GlassGridCardEditor {
    get _defaults() {
      return { ...super._defaults, columns };
    }
  };

const THERMO_SCHEMA = [
  { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
  { name: "name", selector: { text: {} } },
  { name: "show_modes", selector: { boolean: {} } },
  APPEARANCE_SCHEMA[1],
];

class GlassThermostatCardEditor extends GlassBaseEditor {
  get _schema() {
    return THERMO_SCHEMA;
  }
  get _defaults() {
    return { blur: 15, opacity: 10, show_modes: true };
  }
}


const CLOCK_SCHEMA = [
  pairOf(bool("show_weekday"), bool("show_date")),
  pairOf(bool("show_year"), bool("show_seconds")),
  bool("show_saint"),
  APPEARANCE_SCHEMA[1],
];

class GlassClockCardEditor extends GlassBaseEditor {
  get _schema() {
    return CLOCK_SCHEMA;
  }
  get _defaults() {
    return { show_seconds: false, show_weekday: true, show_date: true, show_year: false, show_saint: true, blur: 15, opacity: 10 };
  }
}

const MEDIA_SCHEMA = [
  { name: "entity", required: true, selector: { entity: { domain: "media_player" } } },
  { name: "name", selector: { text: {} } },
  pairOf(bool("show_volume"), bool("show_controls")),
  pairOf(bool("show_artwork"), bool("show_power")),
  APPEARANCE_SCHEMA[1],
];

class GlassMediaCardEditor extends GlassBaseEditor {
  get _schema() {
    return MEDIA_SCHEMA;
  }
  get _defaults() {
    return { show_artwork: true, show_volume: true, show_controls: true, show_power: true, blur: 15, opacity: 5 };
  }
}

const WEATHER_SCHEMA = [
  { name: "entity", required: true, selector: { entity: { domain: "weather" } } },
  { name: "name", selector: { text: {} } },
  bool("show_details"),
  pairOf(bool("show_hourly"), { name: "hours", selector: { number: { min: 1, max: 12, step: 1, mode: "box" } } }),
  pairOf(bool("show_daily"), { name: "days", selector: { number: { min: 1, max: 10, step: 1, mode: "box" } } }),
  APPEARANCE_SCHEMA[1],
];

class GlassWeatherCardEditor extends GlassBaseEditor {
  get _schema() {
    return WEATHER_SCHEMA;
  }
  get _defaults() {
    return { show_details: true, show_hourly: true, show_daily: true, hours: 6, days: 5, blur: 15, opacity: 10 };
  }
}

const MEMBERS_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "people", selector: { entity: { domain: "person", multiple: true } } },
  bool("show_count"),
  APPEARANCE_SCHEMA[1],
];

class GlassMembersCardEditor extends GlassBaseEditor {
  get _schema() {
    return MEMBERS_SCHEMA;
  }
  get _defaults() {
    return { show_count: true, blur: 15, opacity: 10 };
  }
  // Le formulaire manipule une liste d'ids ; on conserve les objets { entity, name } existants.
  _toForm(config) {
    const { entities, ...rest } = config;
    return { ...rest, people: (entities || []).map((e) => normalizeEntity(e).entity) };
  }
  _fromForm(value) {
    const { people, ...rest } = value;
    const prev = new Map((this._config.entities || []).map((e) => [normalizeEntity(e).entity, e]));
    return { ...rest, entities: (people || []).map((id) => prev.get(id) ?? id) };
  }
}

/* ---------- Enregistrement ---------- */

// Deux versions chargées (ex. deux ressources glass-card.js) : la première gagne pour
// chaque carte déjà définie. On le signale clairement dans la console.
if (window.__GLASS_CARD_VERSION && window.__GLASS_CARD_VERSION !== VERSION) {
  console.warn(
    `Glass Card : la version ${window.__GLASS_CARD_VERSION} est déjà chargée, la ${VERSION} est ignorée en partie. ` +
      "Supprimez les ressources glass-card.js en double (Paramètres → Tableaux de bord → Ressources) puis rechargez avec Ctrl+F5."
  );
}
window.__GLASS_CARD_VERSION = window.__GLASS_CARD_VERSION || VERSION;

const define = (tag, cls) => {
  if (!customElements.get(tag)) customElements.define(tag, cls);
};
define("glass-card", GlassCard);
define("glass-card-editor", GlassCardEditor);
define("glass-grid-card", GlassGridCard);
define("glass-grid-card-editor", GlassGridCardEditor);
define("glass-grid-1-card", GlassColumnCard);
define("glass-grid-1-card-editor", gridEditorVariant(1));
define("glass-grid-3-card", GlassGrid3Card);
define("glass-grid-3-card-editor", gridEditorVariant(3));
define("glass-thermostat-card", GlassThermostatCard);
define("glass-thermostat-card-editor", GlassThermostatCardEditor);
define("glass-clock-card", GlassClockCard);
define("glass-clock-card-editor", GlassClockCardEditor);
define("glass-media-card", GlassMediaCard);
define("glass-media-card-editor", GlassMediaCardEditor);
define("glass-weather-card", GlassWeatherCard);
define("glass-weather-card-editor", GlassWeatherCardEditor);
define("glass-members-card", GlassMembersCard);
define("glass-members-card-editor", GlassMembersCardEditor);
define("glass-members-badge", GlassMembersBadge);

window.customCards = window.customCards || [];
const register = (card) => {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push(card);
};
register({
  type: "glass-card",
  name: "Glass Card",
  description: "Tuile glassmorphism pour un interrupteur, une lumière ou un capteur.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-grid-card",
  name: "Glass Grid Card",
  description: "Plusieurs tuiles glassmorphism regroupées dans un bloc de verre (2 colonnes).",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-grid-1-card",
  name: "Glass Grid Card · 1 colonne",
  description: "Tuiles glassmorphism empilées les unes sous les autres.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-grid-3-card",
  name: "Glass Grid Card · 3 colonnes",
  description: "Tuiles glassmorphism sur trois colonnes.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-thermostat-card",
  name: "Glass Thermostat Card",
  description: "Thermostat en verre avec pastille d'état (en chauffe, consigne atteinte…).",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-clock-card",
  name: "Glass Clock Card",
  description: "Heure, date et fête du jour, chaque élément activable.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-media-card",
  name: "Glass Media Card",
  description: "Lecteur média avec pochette floutée, volume façon Apple et boutons de lecture.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-weather-card",
  name: "Glass Weather Card",
  description: "Météo façon Apple : maintenant, heure par heure et semaine.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});
register({
  type: "glass-members-card",
  name: "Glass Members Card",
  description: "Membres de la maison : avatars, présence (pastille verte) et compteur.",
  preview: true,
  documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
});

window.customBadges = window.customBadges || [];
if (!window.customBadges.some((b) => b.type === "glass-members-badge")) {
  window.customBadges.push({
    type: "glass-members-badge",
    name: "Glass Members Badge",
    description: "Membres de la maison en badge : avatars, présence et compteur.",
    preview: true,
    documentationURL: "https://github.com/mrcouscous49-ui/glass-card",
  });
}

console.info(
  `%c GLASS-CARD %c v${VERSION} `,
  "color: white; background: #34c759; font-weight: 700; border-radius: 4px 0 0 4px; padding: 2px 4px;",
  "color: #34c759; background: #1c1c1e; border-radius: 0 4px 4px 0; padding: 2px 4px;"
);
