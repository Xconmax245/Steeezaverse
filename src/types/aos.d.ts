declare module "aos" {
  interface AOSOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
    disable?: boolean | string | (() => boolean);
  }
  interface AOSInstance {
    refresh: () => void;
    refreshHard: () => void;
  }
  export function init(options?: AOSOptions): AOSInstance;
  export function refresh(): void;
  const _default: { init: typeof init; refresh: typeof refresh };
  export default _default;
}
