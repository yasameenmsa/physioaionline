import { connectDB } from './db';
import User from '@/models/User';

/**
 * Migration script to set emailVerified=true for existing users
 * This should be run once when deploying the email verification feature
 */
export async function migrateExistingUsers() {
  try {
    await connectDB();

    console.log('Starting migration for existing users...');

    // Update all users who don't have emailVerified set to true
    const result = await User.updateMany(
      { emailVerified: { $exists: false } },
      { emailVerified: true }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} users.`);

    return {
      success: true,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run this script directly with: npx tsx lib/migration.ts
 */
if (require.main === module) {
  migrateExistingUsers()
    .then((result) => {
      if (result.success) {
        console.log('Migration successful!');
        process.exit(0);
      } else {
        console.error('Migration failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}
