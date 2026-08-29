import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8">
          <p className="text-gray-700 dark:text-gray-200 font-medium">Something went wrong.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-sm text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
