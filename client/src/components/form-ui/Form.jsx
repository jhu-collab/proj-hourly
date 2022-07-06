import React from 'react';

/**
 * Represents a reusable form component that inspired by the html "form" element.
 * @param {*} children: the children
 * @returns A reusuable form component.
 */
export function Form({children, ...other}) {
  return (
    <form autoComplete="off" {...other}>
      {children}
    </form>
  );
}