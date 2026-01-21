# Productivity Tamagotchi

A desktop "Productivity Tamagotchi" application built with Electron. This app combines a virtual pet simulation with daily task management to help you stay productive and build healthy habits.

## Features

- **Virtual Pet**: A companion that reacts to your productivity and habits.
    - **Stats**: Health, Happiness, Energy, and Hydration managed by your actions.
    - **Visual States**: The pet changes mood based on its status.
- **Task Manager**: Add and complete daily tasks to earn XP and feed your pet.
- **Habit Tracking**: Logs for water intake and sleep.
- **Gamification**:
    - **XP & Levels**: Level up by being productive.
    - **Currency (Coins)**: Earn coins to spend in the shop.
    - **Shop**: Buy backgrounds and skins (in progress).
- **System Integration**:
    - **Tray Mode**: Runs in the background.
    - **Always on Top**: Pin the widget to your screen.
    - **Notifications**: Get reminders when your pet needs attention.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/bochamaakram/tamagotchi-life-helper.git
    cd tamagotchi-life-helper
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Usage

**Start the application**:

```bash
npm start
```

*Note: If you encounter sandbox issues on Linux, the start script includes `--no-sandbox`.*

## Tech Stack

- **Electron**: Main framework.
- **Vanilla JavaScript**: Frontend logic.
- **HTML/CSS**: UI and Styling (Widget-style).
- **electron-store**: Data persistence.

## License

ISC
