const mongoose = require('mongoose');

/**
 * Transaction Helper Utility
 * 
 * Provides ACID-compliant transaction support for MongoDB operations.
 * 
 * ISOLATION LEVEL: Snapshot Isolation
 * - Read Concern: 'snapshot' - All reads see a consistent snapshot of data
 * - Write Concern: 'majority' - Writes must be acknowledged by majority of replica set
 * 
 * This provides:
 * - Atomicity: All operations succeed or all fail
 * - Consistency: Database remains in valid state
 * - Isolation: Concurrent transactions don't interfere with each other
 * - Durability: Committed transactions persist even after system failure
 */

/**
 * Execute a function within a MongoDB transaction
 * 
 * @param {Function} callback - Async function that receives the session object
 * @returns {Promise} - Result from the callback function
 * @throws {Error} - If transaction fails, automatically rolls back
 * 
 * @example
 * const result = await executeInTransaction(async (session) => {
 *   await Model1.create([data], { session });
 *   await Model2.updateOne(filter, update, { session });
 *   return someResult;
 * });
 */
async function executeInTransaction(callback) {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  
  try {
    // Start transaction with snapshot isolation
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary' // Ensure we read from primary in replica set
    });
    
    // Execute the callback with the session
    const result = await callback(session);
    
    // If successful, commit the transaction
    await session.commitTransaction();
    
    return result;
  } catch (error) {
    // If any error occurs, abort the transaction (rollback)
    await session.abortTransaction();
    throw error; // Re-throw to let caller handle it
  } finally {
    // Always end the session to free resources
    session.endSession();
  }
}

/**
 * Check if multi-document transactions are supported
 * This requires a MongoDB replica set or sharded cluster
 * 
 * @returns {Promise<boolean>} - True if transactions are supported
 */
async function isTransactionSupported() {
  try {
    const session = await mongoose.startSession();
    session.endSession();
    return true;
  } catch (error) {
    console.warn('Transactions not supported. Using standalone MongoDB?', error.message);
    return false;
  }
}

module.exports = {
  executeInTransaction,
  isTransactionSupported
};

