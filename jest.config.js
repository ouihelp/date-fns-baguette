module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
