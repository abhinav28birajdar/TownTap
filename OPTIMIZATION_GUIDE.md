# TownTap Project Optimization Guide

This guide explains how to optimize and clean up the TownTap project structure using our optimization script.

## Why Optimize?

The TownTap project has accumulated redundant files, duplicate code, and inconsistent naming conventions. Our optimization script helps to:

1. **Remove redundant files** - Eliminates duplicate documentation, old schema files, and deprecated components
2. **Rename files** - Ensures consistent naming conventions across the project
3. **Create symbolic links** - Makes component paths more intuitive without duplicating code
4. **Install missing dependencies** - Adds required packages for animations and UI enhancements
5. **Configure build tools** - Updates Babel configuration for Reanimated support
6. **Fix JSX in JS files** - Helps resolve common React Native bundling issues

## Running the Optimization Script

```bash
# Make sure you have Node.js installed
node scripts/optimize-project.js
```

## What the Script Does

1. **Removes redundant files**:
   - Duplicate README files
   - Old database schema files
   - Deprecated configuration files
   - Legacy theme files

2. **Renames files** to their optimized versions:
   - `enhanced-theme.ts` → `modernTheme.ts`
   - `index_new.ts` → `index.ts`
   - `locationStoreNew.ts` → `locationStore.ts`

3. **Creates symbolic links** for UI components:
   - Links legacy component paths to their modern implementations
   - Ensures backward compatibility while reducing code duplication

4. **Installs necessary dependencies**:
   - `moti` - Animation library built on Reanimated
   - `react-native-reanimated` - Advanced animations
   - `expo-haptics` - Haptic feedback

5. **Updates Babel configuration** for Reanimated support

6. **Creates a fix-jsx script** to help resolve JSX in JS files issues

## Post-Optimization Steps

After running the optimization script:

1. **Restart your development server** with a clean cache:
   ```bash
   npx expo start --clear
   ```

2. **If you encounter JSX issues**, run:
   ```bash
   npm run fix-jsx
   ```

3. **Test all main functionality** to ensure the optimization hasn't broken anything

## Common Issues & Solutions

### Bundling Issues

If you encounter bundling errors related to JSX in .js files:

```bash
npm run fix-jsx
```

This will convert problematic .js files with JSX to .jsx files.

### Reanimated Errors

If you see warnings about react-native-reanimated:

1. Ensure the plugin is properly configured in babel.config.js
2. Rebuild the app with:
   ```bash
   npm run clean-start
   ```

### Module Resolution Errors

If you encounter module resolution errors after optimization:

```bash
npm cache clean --force
npx expo start --clear
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/environment-setup)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Moti Animation Library](https://moti.fyi/)
