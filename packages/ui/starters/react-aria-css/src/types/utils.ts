/**
 * Flattens intersection types for better IDE tooltips.
 *
 * When you hover over a type that uses intersections (`A & B`) or utilities
 * like `Omit<>`, TypeScript shows the unexpanded form. Prettify forces
 * TypeScript to evaluate and display the final flattened shape.
 *
 * @example
 * type UserResponse = Omit<User, "password"> & { role: string };
 * // Hover shows: Omit<User, "password"> & { role: string }
 *
 * type PrettyUserResponse = Prettify<Omit<User, "password"> & { role: string }>;
 * // Hover shows: { id: string; name: string; role: string }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
