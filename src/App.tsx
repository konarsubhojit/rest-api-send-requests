import React from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApplicationController } from './components/controllers/ApplicationController';

/**
 * SOLID-Compliant App Component
 * 
 * This refactored version follows SOLID principles:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - App.tsx now only handles top-level structure and error boundaries
 *    - Reduced from 379 lines to ~25 lines
 *    - Each component has a single, well-defined responsibility
 * 
 * 2. Open/Closed Principle (OCP):
 *    - New authentication strategies can be added via AuthStrategyFactory
 *    - New body types can be added via BodyBuilderFactory
 *    - Components are open for extension, closed for modification
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - All strategy implementations can be substituted without breaking functionality
 *    - Component interfaces are consistent and predictable
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Large prop interfaces broken into smaller, focused interfaces
 *    - Components only depend on methods they actually use
 *    - No more bloated RequestFormProps with 11+ callbacks
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - Services depend on abstractions (IApiService, IStorageService)
 *    - Concrete implementations can be swapped out
 *    - High-level modules don't depend on low-level modules
 * 
 * Architecture Patterns Used:
 * - Strategy Pattern: AuthStrategies, BodyBuilders
 * - Command Pattern: RequestCommands for undo/redo capability
 * - Factory Pattern: Strategy and builder creation
 * - Facade Pattern: ApiService simplifies complex operations
 * - Composite Pattern: Modular component composition
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <ApplicationController />
      </div>
    </ErrorBoundary>
  );
}

export default App;
