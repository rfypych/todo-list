import { useState, useEffect } from 'react';
import { FaGithub, FaSave, FaTimes, FaCheck } from 'react-icons/fa';
import githubService from '../services/GitHubService';

const GitHubSettings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load saved settings on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    const savedRepo = localStorage.getItem('github_repo');

    if (savedToken && savedRepo) {
      setToken(savedToken);
      setRepo(savedRepo);

      // Initialize GitHub service with saved credentials
      const initialized = githubService.init(savedToken, savedRepo);
      setIsConnected(initialized);
    }
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('GitHub token is required');
      return;
    }

    if (!repo) {
      setError('GitHub repository is required (format: username/repo-name)');
      return;
    }

    // Validate repo format
    if (!repo.match(/^[^/]+\/[^/]+$/)) {
      setError('Repository format should be username/repo-name');
      return;
    }

    console.log('Initializing GitHub service with repo:', repo);

    // Initialize GitHub service
    const initialized = githubService.init(token, repo);

    if (initialized) {
      console.log('GitHub service initialized successfully');

      // Test the connection by trying to get the latest commit SHA
      try {
        // Save to localStorage first so we can test with these credentials
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_repo', repo);

        // Create a test file to verify permissions
        const testPath = `contributions/test-connection.md`;
        const testContent = `# GitHub Connection Test\n\nThis file was created to test the GitHub connection.\nTimestamp: ${new Date().toISOString()}\n`;
        const testMessage = 'Test GitHub connection';

        const result = await githubService.createFile(testPath, testContent, testMessage);

        if (result) {
          console.log('Successfully created test file in GitHub repository');
          setIsConnected(true);
          setSuccess('GitHub connection successful! Test file created.');

          // Close settings after a delay
          setTimeout(() => {
            setShowSettings(false);
          }, 2000);
        } else {
          console.error('Failed to create test file');
          setError('Failed to create test file in repository. Please check your permissions.');
        }
      } catch (error) {
        console.error('Error testing GitHub connection:', error);

        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);

          if (error.response.status === 401) {
            setError('Authentication failed. Please check your token.');
          } else if (error.response.status === 404) {
            setError('Repository not found. Please check the repository name.');
          } else {
            setError(`GitHub API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
          }
        } else {
          setError('Failed to connect to GitHub. Please check your network connection.');
        }

        // Remove saved credentials on failure
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_repo');
      }
    } else {
      setError('Failed to initialize GitHub service. Please check your credentials.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_repo');
    setToken('');
    setRepo('');
    setIsConnected(false);
    setSuccess('GitHub disconnected successfully');
  };

  return (
    <div className="github-settings-container">
      <button
        className={`github-btn ${isConnected ? 'connected' : ''}`}
        onClick={() => setShowSettings(!showSettings)}
        title={isConnected ? 'GitHub Connected' : 'Connect to GitHub'}
      >
        <FaGithub /> {isConnected && <span className="connected-indicator"><FaCheck /></span>}
      </button>

      {showSettings && (
        <div className="github-settings-modal">
          <div className="github-settings-header">
            <h3><FaGithub /> GitHub Integration</h3>
            <button
              className="close-btn"
              onClick={() => setShowSettings(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="github-settings-content">
            <p className="github-description">
              Connect your GitHub account to record task completions as contributions.
              Each completed task will create a commit in your repository.
            </p>

            <div className="setting-group">
              <label htmlFor="github-token">GitHub Personal Access Token:</label>
              <input
                type="password"
                id="github-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <small>
                Create a token with 'repo' scope at{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Settings
                </a>
              </small>
            </div>

            <div className="setting-group">
              <label htmlFor="github-repo">Repository (username/repo-name):</label>
              <input
                type="text"
                id="github-repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="username/repository-name"
              />
              <small>
                Example: rfypych/my-todo-list
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="github-settings-actions">
              {isConnected ? (
                <>
                  <button className="disconnect-btn" onClick={handleDisconnect}>
                    <FaTimes /> Disconnect
                  </button>
                  <button className="save-btn" onClick={handleSave}>
                    <FaSave /> Update
                  </button>
                </>
              ) : (
                <button className="save-btn" onClick={handleSave}>
                  <FaSave /> Connect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubSettings;
