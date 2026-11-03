import type { DigitalTwinExtension, DigitalTwinExtensionContext } from "@penn-state-dt/extension-sdk";
import "./style.css";

const PALMER_ASSET_ID = 4695044;
const sampleSensors = [
  { id: "palmer-demo-temperature", label: "Gallery temperature", value: "21.4 °C", longitude: -77.86810, latitude: 40.80678 },
  { id: "palmer-demo-humidity", label: "Gallery humidity", value: "46% RH", longitude: -77.86800, latitude: 40.80670 },
];
const temperatureHistory = [20.8, 21.0, 20.9, 21.2, 21.4, 21.3, 21.5, 21.4, 21.6, 21.4, 21.3, 21.4];
const humidityHistory = [43, 44, 45, 44, 46, 47, 46, 45, 46, 47, 46, 46];

type OverlayHandle = { open: () => void; close: () => void; toggle: () => void; dispose: () => void };
type MarkerHandle = { show: boolean };

let context: DigitalTwinExtensionContext | undefined;
let panel: OverlayHandle | undefined;
let mapOverlay: OverlayHandle | undefined;
let markers: MarkerHandle[] = [];

function createTrendChart(title: string, unit: string, values: number[], color: string): HTMLElement {
  const host = document.createElement("section");
  host.className = "palmer-chart";
  const heading = document.createElement("div");
  heading.className = "palmer-chart-heading";
  heading.textContent = `${title} · last 12 hours`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 300 112");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${title} historical sample chart`);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.1);
  const points = values.map((value, index) => {
    const x = 14 + (index * 272) / (values.length - 1);
    const y = 88 - ((value - min) / span) * 62;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const grid = document.createElementNS("http://www.w3.org/2000/svg", "path");
  grid.setAttribute("d", "M14 26H286 M14 57H286 M14 88H286");
  grid.setAttribute("class", "palmer-chart-grid");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("points", points);
  line.setAttribute("class", "palmer-chart-line");
  line.setAttribute("style", `stroke:${color}`);
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", "14");
  label.setAttribute("y", "106");
  label.setAttribute("class", "palmer-chart-label");
  label.textContent = `${values.at(-1)} ${unit}`;
  svg.append(grid, line, label);
  host.append(heading, svg);
  return host;
}

async function focusPalmer(): Promise<void> {
  try {
    await context?.navigation.flyToAsset(PALMER_ASSET_ID);
  } catch {
    await context?.navigation.flyToCoordinates(-77.86806, 40.80676, { height: 760, duration: 0.8 });
  }
}

function setVisible(visible: boolean): void {
  for (const marker of markers) marker.show = visible;
  if (visible) {
    panel?.open();
    mapOverlay?.open();
    void focusPalmer();
  } else {
    panel?.close();
    mapOverlay?.close();
  }
}

const extension: DigitalTwinExtension = {
  activate(nextContext) {
    context = nextContext;
    panel = context.ui.addSidePanel({
      id: "palmer-museum",
      title: "Palmer Example Extension 01",
      className: "extension-palmer-museum",
      render(container) {
        const note = document.createElement("p");
        note.className = "palmer-note";
        note.textContent = "Demonstration data only — not live museum telemetry.";
        const cards = document.createElement("div");
        cards.className = "palmer-sensor-list";
        for (const sensor of sampleSensors) {
          const card = document.createElement("article");
          card.className = "palmer-sensor";
          const label = document.createElement("strong");
          label.textContent = sensor.label;
          const value = document.createElement("span");
          value.textContent = sensor.value;
          card.append(label, value);
          cards.appendChild(card);
        }
        const charts = document.createElement("div");
        charts.className = "palmer-chart-grid-wrap";
        charts.append(
          createTrendChart("Temperature", "°C", temperatureHistory, "#6ea8ff"),
          createTrendChart("Humidity", "% RH", humidityHistory, "#59d3bb"),
        );
        container.append(note, cards, charts);
      },
    });
    mapOverlay = context.ui.addMapOverlay({
      id: "sensor-summary",
      title: "Palmer Example Extension 01",
      placement: "bottom-left",
      className: "extension-palmer-overlay",
      render(container) {
        const summary = document.createElement("p");
        summary.className = "palmer-overlay-summary";
        summary.textContent = `${sampleSensors.length} sample sensors · not live telemetry`;
        const chart = createTrendChart("Temperature", "°C", temperatureHistory, "#8bb7ff");
        const open = document.createElement("button");
        open.type = "button";
        open.className = "palmer-overlay-action";
        open.textContent = "Open full history";
        open.addEventListener("click", () => panel?.open());
        container.append(summary, chart, open);
      },
    });
    markers = sampleSensors.map((sensor) => context!.entities.addMarker({
      ...sensor,
      name: sensor.label,
      height: 6,
      surface: "3d-tiles",
      color: "#4f8cff",
      properties: { value: sensor.value, sampleData: true, building: "Palmer Museum", address: "650 Bigler Road" },
    }));
    setVisible(false);
    context.ui.addToolbarToggle({
      id: "palmer-example",
      label: "Palmer Example Extension 01",
      initiallyActive: false,
      onChange: setVisible,
    });
  },
  deactivate() {
    markers = [];
    context = undefined;
    panel = undefined;
    mapOverlay = undefined;
  },
};

export default extension;
