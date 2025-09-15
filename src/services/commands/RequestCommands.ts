import { ICommand, IRequestCommand } from '../interfaces/ICommand';
import { AppDispatch } from '../../store/index';
import {
  setBaseUrl,
  addParameter,
  loadRequest
} from '../../store/slices/requestSlice';
import { ApiRequest } from '../../types/api';

/**
 * Base Command Class - Command Pattern
 */
abstract class BaseCommand implements ICommand {
  constructor(protected description: string) {}

  abstract execute(): Promise<void>;
  
  getDescription(): string {
    return this.description;
  }

  async undo(): Promise<void> {
    // Default implementation - can be overridden
  }

  canUndo(): boolean {
    return false; // Default - can be overridden
  }
}

/**
 * Update Base URL Command
 */
export class UpdateBaseUrlCommand extends BaseCommand implements IRequestCommand {
  private previousUrl?: string;

  constructor(
    private dispatch: AppDispatch,
    private newUrl: string,
    private requestId?: string
  ) {
    super(`Update base URL to: ${newUrl}`);
  }

  async execute(): Promise<void> {
    // Note: In a real implementation, you'd want to get the previous URL first
    this.dispatch(setBaseUrl(this.newUrl));
  }

  async undo(): Promise<void> {
    if (this.previousUrl) {
      this.dispatch(setBaseUrl(this.previousUrl));
    }
  }

  canUndo(): boolean {
    return Boolean(this.previousUrl);
  }

  getRequestId(): string {
    return this.requestId || 'default';
  }
}

/**
 * Add Parameter Command
 */
export class AddParameterCommand extends BaseCommand implements IRequestCommand {
  constructor(
    private dispatch: AppDispatch,
    private parameter: { id: string; key: string; value: string },
    private requestId?: string
  ) {
    super(`Add parameter: ${parameter.key}=${parameter.value}`);
  }

  async execute(): Promise<void> {
    this.dispatch(addParameter(this.parameter));
  }

  async undo(): Promise<void> {
    // Find and remove the parameter by ID
    // Note: This would need access to current state to find the index
  }

  getRequestId(): string {
    return this.requestId || 'default';
  }
}

/**
 * Load Request Command
 */
export class LoadRequestCommand extends BaseCommand implements IRequestCommand {
  private previousRequest?: ApiRequest;

  constructor(
    private dispatch: AppDispatch,
    private request: ApiRequest,
    private requestId: string
  ) {
    super(`Load request: ${request.method} ${request.baseUrl}`);
  }

  async execute(): Promise<void> {
    // Note: In a real implementation, you'd want to store the previous request
    this.dispatch(loadRequest(this.request));
  }

  async undo(): Promise<void> {
    if (this.previousRequest) {
      this.dispatch(loadRequest(this.previousRequest));
    }
  }

  canUndo(): boolean {
    return Boolean(this.previousRequest);
  }

  getRequestId(): string {
    return this.requestId;
  }
}

/**
 * Batch Command - Composite Pattern
 * Executes multiple commands as a single unit
 */
export class BatchCommand extends BaseCommand {
  private executed: ICommand[] = [];

  constructor(
    private commands: ICommand[],
    description?: string
  ) {
    super(description || `Batch operation (${commands.length} commands)`);
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      try {
        await command.execute();
        this.executed.push(command);
      } catch (error) {
        // Rollback executed commands
        await this.undo();
        throw error;
      }
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.executed.length - 1; i >= 0; i--) {
      const command = this.executed[i];
      if (command.canUndo?.()) {
        await command.undo?.();
      }
    }
    this.executed = [];
  }

  canUndo(): boolean {
    return this.executed.length > 0;
  }
}
