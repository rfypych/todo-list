import { Octokit } from 'octokit';

class GitHubService {
  constructor() {
    this.octokit = null;
    this.user = null;
    this.repo = null;
  }

  // Initialize with GitHub token
  init(token, repo) {
    if (!token) return false;

    try {
      this.octokit = new Octokit({ auth: token });

      // Extract username and repo name from repo URL
      // Format: username/repo-name
      const [username, repoName] = repo.split('/');
      this.user = username;
      this.repo = repoName;

      return true;
    } catch (error) {
      console.error('Error initializing GitHub service:', error);
      return false;
    }
  }

  // Check if the service is initialized
  isInitialized() {
    return !!this.octokit && !!this.user && !!this.repo;
  }

  // Get the latest commit SHA for the default branch
  async getLatestCommitSha() {
    if (!this.isInitialized()) return null;

    try {
      const { data } = await this.octokit.rest.repos.getBranch({
        owner: this.user,
        repo: this.repo,
        branch: 'main', // Using main as the default branch
      });

      return data.commit.sha;
    } catch (error) {
      console.error('Error getting latest commit SHA:', error);
      return null;
    }
  }

  // Base64 encode function for browser environment
  _base64Encode(str) {
    // Convert the string to UTF-8 bytes
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert bytes to binary string
    const binaryStr = Array.from(utf8Bytes)
      .map(byte => String.fromCharCode(byte))
      .join('');
    // Encode to base64
    return btoa(binaryStr);
  }

  // Create a new file in the repository
  async createFile(path, content, message) {
    if (!this.isInitialized()) return false;

    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.user,
        repo: this.repo,
        path,
        message,
        content: this._base64Encode(content),
      });

      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  }

  // Update an existing file in the repository
  async updateFile(path, content, message) {
    if (!this.isInitialized()) return false;

    try {
      // Get the current file to get its SHA
      const { data: fileData } = await this.octokit.rest.repos.getContent({
        owner: this.user,
        repo: this.repo,
        path,
      });

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.user,
        repo: this.repo,
        path,
        message,
        content: this._base64Encode(content),
        sha: fileData.sha,
      });

      return true;
    } catch (error) {
      // If the file doesn't exist, create it
      if (error.status === 404 || (error.response && error.response.status === 404)) {
        return this.createFile(path, content, message);
      }

      console.error('Error updating file:', error);
      return false;
    }
  }

  // Make a commit when a task is completed
  async commitTaskCompletion(taskTitle) {
    if (!this.isInitialized()) {
      console.log('GitHub service not initialized');
      return false;
    }

    console.log('Starting GitHub commit for task:', taskTitle);
    console.log('Using repository:', this.user + '/' + this.repo);

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = `contributions/${dateStr}.md`;
    const commitMessage = `Completed task: ${taskTitle}`;
    const fileContent = `# Task Completed\n\nTask: ${taskTitle}\nCompleted at: ${today.toISOString()}\n`;

    try {
      console.log('Creating/updating file:', filePath);

      // Create the file directly instead of trying to update first
      const result = await this.createFile(filePath, fileContent, commitMessage);

      if (result) {
        console.log('Successfully created GitHub contribution for task:', taskTitle);
      } else {
        console.log('Failed to create GitHub contribution');
      }

      return result;
    } catch (error) {
      console.error('Error committing task completion:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      return false;
    }
  }
}

// Create a singleton instance
const githubService = new GitHubService();
export default githubService;
