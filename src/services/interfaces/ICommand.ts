/**
 * Command interface - Command Pattern
 * Encapsulates actions as objects for better organization and undo/redo capability
 */
export interface ICommand {
  execute(): Promise<void>;
  undo?(): Promise<void>;
  canUndo?(): boolean;
  getDescription(): string;
}

/**
 * Request commands for different operations
 */
export interface IRequestCommand extends ICommand {
  getRequestId(): string;
}

/**
 * UI commands for state changes
 */
export interface IUICommand extends ICommand {
  getTarget(): string;
}

/**
 * Command manager for orchestrating commands
 */
export interface ICommandManager {
  execute(command: ICommand): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  canUndo(): boolean;
  canRedo(): boolean;
  getHistory(): ICommand[];
  clear(): void;
}
