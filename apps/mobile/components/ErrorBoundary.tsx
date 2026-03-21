import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorScreen } from './ErrorScreen'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

/**
 * React error boundary that catches render errors in its subtree.
 * Shows an ErrorScreen with a retry button.
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error info for debugging
		console.error('[ErrorBoundary] Caught error:', error)
		console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}
			return <ErrorScreen message={this.state.error?.message} onRetry={this.handleRetry} />
		}
		return this.props.children
	}
}
