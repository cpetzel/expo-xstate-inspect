type Listener = (data: any) => void;

/** Minimal emitter, replaces the deprecated react-native/Libraries deep import */
export class EventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  addListener(event: string, listener: Listener) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener);
    this.listeners.set(event, set);
    return { remove: () => set.delete(listener) };
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((l) => l(data));
  }

  listenerCount(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }

  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
  }
}
