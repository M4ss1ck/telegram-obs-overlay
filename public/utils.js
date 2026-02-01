// Shared utility functions and constants for Telegram OBS Overlay

// Color preset values - keep background color transparent but customize message colors
const presetColors = {
  dark: {
    bg: "#1e1e1e",
    bgOpacity: 0,
    msgBg: "#3c3c3c",
    msgOpacity: 80,
    text: "#ffffff",
    name: "#ffffff",
  },
  light: {
    bg: "#f0f0f0",
    bgOpacity: 0,
    msgBg: "#ffffff",
    msgOpacity: 90,
    text: "#333333",
    name: "#333333",
  },
  transparent: {
    bg: "#000000",
    bgOpacity: 0,
    msgBg: "#000000",
    msgOpacity: 50,
    text: "#ffffff",
    name: "#ffffff",
  },
  purple: {
    bg: "#2e1065",
    bgOpacity: 0,
    msgBg: "#53319c",
    msgOpacity: 80,
    text: "#ffffff",
    name: "#d8bfff",
  },
  green: {
    bg: "#003024",
    bgOpacity: 0,
    msgBg: "#005c4b",
    msgOpacity: 80,
    text: "#ffffff",
    name: "#a7f3d0",
  },
  gaming: {
    bg: "#000000",
    bgOpacity: 0,
    msgBg: "#141414",
    msgOpacity: 90,
    text: "#00ff00",
    name: "#00ffff",
  },
};

// Convert hex color to rgba string
function convertToRgba(hex, opacity) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// Parse rgba string to hex color and opacity value
function parseColorAndOpacity(rgba) {
  const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const opacity = Math.round(parseFloat(match[4]) * 100);

    // Convert RGB to hex
    const hex =
      "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return [hex, opacity];
  }
  return ["#ffffff", 100];
}
