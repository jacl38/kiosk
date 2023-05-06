const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./"
});

const customJestConfig = {
	// setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleDirectories: ['node_modules', '<rootDir>/'],
	moduleNameMapper: {
		'^@/components/(.*)$': '<rootDir>/components/$1',
		'^@/pages/(.*)$': '<rootDir>/pages/$1'
	},
	testEnvironment: './src/tests/env.js',
	preset: "@shelf/jest-mongodb"
}

module.exports = createJestConfig(customJestConfig);