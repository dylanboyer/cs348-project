# Transaction Support & ACID Principles

## Overview

This project implements **ACID-compliant transactions** using MongoDB's multi-document transaction support.

## Database Configuration

- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: Replica Set (default for Atlas)
- **Transaction Support**: ✅ Fully Supported

## Isolation Level: SNAPSHOT ISOLATION

MongoDB uses **Snapshot Isolation** which provides strong consistency guarantees:

### Transaction Configuration

```javascript
{
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary'
}
```

### What This Means

- **Read Concern: snapshot**
  - All reads within the transaction see a consistent point-in-time snapshot
  - No dirty reads (reading uncommitted data from other transactions)
  - No non-repeatable reads (same query returns same results within transaction)
  - No phantom reads (range queries don't see new documents added by other transactions)

- **Write Concern: majority**
  - Writes must be acknowledged by the majority of replica set members
  - Ensures durability - data survives node failures
  - Provides strong consistency across the cluster

- **Read Preference: primary**
  - All reads go to the primary node in the replica set
  - Ensures we read the most up-to-date data
  - Required for snapshot isolation

## ACID Properties Explained

### Atomicity ⚛️
**All operations in a transaction succeed or all fail - no partial updates**

Example: When deleting a class
- ✅ WITH transactions: Class and all its tasks are deleted together, or neither
- ❌ WITHOUT transactions: Class might be deleted but tasks remain (orphaned data)

### Consistency ✅
**Database moves from one valid state to another valid state**

Example: Foreign key relationships are maintained
- Task.classId always references an existing Class
- No orphaned tasks without a parent class

### Isolation 🔒
**Concurrent transactions don't interfere with each other**

Example: Two users deleting different classes simultaneously
- Transaction 1: Delete Class A and its tasks
- Transaction 2: Delete Class B and its tasks
- Each sees a consistent snapshot, no interference between them

With Snapshot Isolation:
- Each transaction operates on its own snapshot of the data
- Changes from one transaction are invisible to others until committed
- Prevents dirty reads, non-repeatable reads, and phantom reads

### Durability 💾
**Once committed, changes persist even if system crashes**

With `writeConcern: majority`:
- Changes are written to majority of replica set members before commit
- Even if primary node crashes, data is safe on other nodes
- Automatic failover preserves all committed transactions

## Comparison: Single vs Multi-Document Model

### Single-Document Operations (Always Atomic)
MongoDB guarantees atomicity for **single-document** operations without transactions:

```javascript
// This is atomic by default
await Task.updateOne({ _id: taskId }, { $set: { completed: true } });
```

### Multi-Document Operations (Require Transactions)
Operations affecting **multiple documents** need explicit transactions:

```javascript
// WITHOUT transaction - NOT SAFE! ❌
await Task.deleteMany({ classId: classId });  // What if this succeeds...
await Class.findByIdAndDelete(classId);        // ...but this fails?

// WITH transaction - SAFE! ✅
await executeInTransaction(async (session) => {
  await Task.deleteMany({ classId: classId }, { session });
  await Class.findByIdAndDelete(classId, { session });
});
```

## When to Use Transactions

### ✅ Use Transactions For:

1. **Multi-Collection Operations**
   - Deleting a class and all its tasks
   - Moving tasks between classes while updating counts
   - Creating related documents that must exist together

2. **Operations with Business Logic Constraints**
   - Ensuring referential integrity across collections
   - Maintaining aggregate values or computed fields
   - Enforcing complex business rules across documents

3. **Operations Requiring All-or-Nothing Semantics**
   - Batch updates that must all succeed
   - Data migrations affecting multiple collections
   - Critical operations where partial completion is unacceptable

### ❌ Don't Need Transactions For:

1. **Single Document Operations**
   - Creating one task
   - Updating one class
   - Deleting one document

2. **Read-Only Operations**
   - Fetching tasks for a class
   - Searching across collections
   - Aggregation queries

3. **Independent Operations**
   - Operations where partial success is acceptable
   - Eventual consistency is sufficient

## Project-Specific Transaction Usage

### 1. Class Deletion (CRITICAL - Uses Transactions)

**File**: `backend/routes/classes.js`

```javascript
router.delete('/:id', async (req, res) => {
  await executeInTransaction(async (session) => {
    // Delete all tasks first
    await Task.deleteMany({ classId: req.params.id }, { session });
    // Then delete the class
    await Class.findByIdAndDelete(req.params.id, { session });
  });
});
```

**Why?** If task deletion succeeds but class deletion fails (or vice versa), we'd have data inconsistency. The transaction ensures both succeed or both fail.

### 2. Task Creation (Single Document - No Transaction Needed)

**File**: `backend/routes/tasks.js`

```javascript
router.post('/', async (req, res) => {
  const task = new Task({ ... });
  await task.save(); // Single document - atomic by default
});
```

**Why no transaction?** Single document operations are already atomic in MongoDB.

### 3. Task Update (Single Document - No Transaction Needed)

**File**: `backend/routes/tasks.js`

```javascript
router.put('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = req.body.completed;
  await task.save(); // Single document - atomic by default
});
```

**Why no transaction?** We're only updating one document.

## Performance Considerations

### Transaction Overhead
- Transactions have performance cost (locking, coordination)
- Use them only when necessary (multi-document operations)
- Single document operations don't need transactions

### Best Practices
1. **Keep transactions short** - Long transactions hold locks
2. **Use transactions only for multi-document operations**
3. **Handle errors properly** - Always abort on failure
4. **Don't perform network calls inside transactions** - Keep logic fast

## Error Handling

Transactions automatically rollback on any error:

```javascript
try {
  await executeInTransaction(async (session) => {
    await Operation1({ session });
    await Operation2({ session }); // If this fails...
    await Operation3({ session }); // ...this never executes
  });
  // All operations committed successfully
} catch (error) {
  // All operations rolled back automatically
  console.error('Transaction failed:', error);
}
```

## Testing Transaction Support

To verify transactions are working:

```javascript
const { isTransactionSupported } = require('./utils/transactionHelper');

// Check if your MongoDB supports transactions
const supported = await isTransactionSupported();
console.log('Transactions supported:', supported); // Should be true for Atlas
```

## MongoDB Atlas vs Standalone MongoDB

| Feature | Atlas (Replica Set) | Standalone MongoDB |
|---------|-------------------|-------------------|
| Single-doc atomicity | ✅ Yes | ✅ Yes |
| Multi-doc transactions | ✅ Yes | ❌ No |
| Snapshot isolation | ✅ Yes | ❌ No |
| Automatic failover | ✅ Yes | ❌ No |

**Your Project**: Uses **Atlas** ✅ - Full transaction support available!

## Summary

✅ **ACID Properties**: Fully implemented
✅ **Isolation Level**: Snapshot Isolation (strong consistency)
✅ **Multi-Document Support**: Yes (critical for class deletion)
✅ **Single-Document Operations**: Atomic by default
✅ **Production Ready**: Atlas provides robust transaction support

Your project **requires** transactions because of the multi-document operation when deleting classes with their associated tasks. Without transactions, you risk data inconsistency.
