import React, { Component, ReactNode } from "react";
import { Button, Card } from "antd";
import { ReloadOutlined, AlertOutlined } from "@ant-design/icons";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  caughtError: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, caughtError: null };
  }

  static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    return { hasError: true, caughtError: err };
  }

  componentDidCatch(err: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", err, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, caughtError: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertOutlined className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-8">
              {this.state.caughtError?.message 
                ? String(this.state.caughtError.message) 
                : "An unexpected error occurred."}
            </p>
            <div className="flex gap-3">
              <Button icon={<ReloadOutlined />} onClick={this.handleReset} block>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}