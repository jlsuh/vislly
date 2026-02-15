import 'react';

declare module 'react' {
  /**
   * @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/73957
   * TODO: Delete once in DefinitelyTyped
   */
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/command}
     */
    command?:
      | 'show-modal'
      | 'close'
      | 'request-close'
      | 'show-popover'
      | 'hide-popover'
      | 'toggle-popover'
      | `--${string}`
      | undefined;

    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/commandFor}
     */
    commandfor?: string | undefined;
  }
}
