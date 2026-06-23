export default {
  config: {
    default: true,
    MD001: false,
    MD007: { indent: 2 },
    MD012: false,
    MD013: false,
    MD024: false,
    MD025: false,
    MD026: false,
    MD029: false,
    MD033: false,
    MD036: false,
    MD037: false,
    MD041: false,
    MD046: { style: 'fenced' },
    MD060: false,
  },
  gitignore: true,
  // beads/ is tracked by git, so .gitignore doesn't cover it.
  ignores: ['.beads/'],
};
