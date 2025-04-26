# Todo List with Timer Setter

A modern, feature-rich Todo List application with an integrated Pomodoro-style timer to help you manage tasks and boost productivity. Now with GitHub integration to track your completed tasks as contributions!

![Todo List with Timer Setter](https://i.imgur.com/YourScreenshotHere.png)

## Features

### Todo Management
- Create, edit, and delete tasks
- Set priority levels (High, Medium, Low)
- Add detailed descriptions to tasks
- Mark tasks as complete
- Filter tasks by status (All, To Do, In Progress, Done)
- Persistent storage using localStorage

### Timer Functionality
- Pomodoro-style timer with work and break periods
- Customizable work and break durations (minutes and seconds)
- Visual progress indicator
- Sound notifications when timer completes
- Integration with selected tasks for time tracking

### Additional Features
- Dark/Light mode toggle
- Responsive design for desktop and mobile
- Productivity statistics
- Time tracking for tasks
- Visual indicators for task priority and status
- GitHub integration to track completed tasks as contributions

## Technologies Used

- React 18
- Vite
- React Icons
- Date-fns
- UUID
- Octokit (GitHub API)
- CSS3 with custom properties (variables)
- LocalStorage for data persistence

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rfypych/my-todo-list.git
cd my-todo-list
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Adding a Task
1. Type a task title in the input field at the top
2. Click "Add" to create a simple task, or
3. Click "More options" to add description and priority

### Managing Tasks
- Use the filter buttons to view different task categories
- Click the play button on a task to start working on it
- Click the edit button to modify a task
- Click the check button to mark a task as complete
- Click the trash button to delete a task

### Using the Timer
1. Select a task to work on by clicking its play button
2. Use the timer controls to start, pause, and reset the timer
3. Click the settings icon to customize work and break durations
4. The timer will automatically switch between work and break periods
5. A sound will play when the timer completes

### Dark Mode
- Click the sun/moon icon in the header to toggle between light and dark modes

### GitHub Integration
1. Click the GitHub icon in the header
2. Enter your GitHub Personal Access Token (with 'repo' scope)
3. Enter your repository name in the format `username/repo-name`
4. Click "Connect"
5. Now, each time you complete a task, a commit will be made to your GitHub repository
6. These commits will appear in your GitHub contribution graph

## Customization

### Timer Sounds
The application comes with a custom notification sound (Miku alarm) that plays when the timer completes. You can replace this with your own sound by:

1. Adding your sound file to the `src/assets/sounds/` directory
2. Updating the file path in `src/hooks/useTimer.js`

### Styling
The application uses CSS variables for easy customization. You can modify the colors, fonts, and other visual aspects by editing the variables in `src/App.css`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [React Icons](https://react-icons.github.io/react-icons/)
- Date formatting by [date-fns](https://date-fns.org/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
