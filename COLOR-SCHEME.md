# StudyFlow Color Scheme

This is the implemented palette for the StudyFlow student portal. All values are defined as CSS custom properties in `app/globals.css`; components reference them through `var(--token)` so the whole app follows this scheme in light and dark mode.

## Primary Colors (Azure)

| Name | Hex | Intended use |
| --- | --- | --- |
| Azure | `#0078D4` | Primary buttons, links, active nav, and key actions (light mode) |
| Azure Pressed | `#005FB8` | Hover states for primary actions (light mode) |
| Bright Azure | `#0099FF` | Primary actions and accents (dark mode) |
| Bright Azure Pressed | `#007ACC` | Hover states for primary actions (dark mode) |

## Background Colors

| Name | Light | Dark | Intended use |
| --- | --- | --- | --- |
| Main Background | `#E8F3FC` | `#0A2333` | Page and card surfaces (azure-tinted, never neutral grey) |
| Muted | `#D6EAF9` | `#123A54` | Hover rows, chips, pressed wells, badges |
| Border | `#CCE4F7` | `#1B4A69` | Dividers, input outlines, hairlines |

## Neumorphic Depth

| Name | Light | Dark | Intended use |
| --- | --- | --- | --- |
| Light shadow | `#FFFFFF` | `#1E5173` | Upper-left highlight of raised surfaces |
| Dark shadow | `#B5D2EA` | `#04121D` | Lower-right shade of raised surfaces |

## Text Colors

| Name | Light | Dark | Intended use |
| --- | --- | --- | --- |
| Primary Text | `#0F3A5E` | `#E3F2FD` | Main headings and important content |
| Muted Text | `#3B6B96` | `#8FB6D4` | Labels, metadata, and supporting information |
| On Accent | `#FFFFFF` | `#FFFFFF` | Text over azure buttons and nav highlights |

## Status and Interface Colors

| Name | Light | Dark | Intended use |
| --- | --- | --- | --- |
| Completed / Success | `#16A34A` | `#4ADE80` | Completed assignments and success messages |
| Upcoming / Attention | `#F59E0B` | `#FBBF24` | Approaching deadlines and reminders |
| Overdue / Error | `#DC2626` | `#F87171` | Overdue items and validation errors |
| Sky | `#0EA5E9` | `#38BDF8` | Secondary informational accents |

## Auth Hero Panel

The split-screen auth pages use `public/images/auth-hero.jpg` beneath an azure gradient overlay (`rgba(0,58,105,0.86)` → `rgba(0,133,214,0.72)`) with radial azure glows, defined by `.auth-hero` in `app/globals.css`.
