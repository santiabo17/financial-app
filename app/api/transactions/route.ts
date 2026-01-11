// app/api/products/route.ts (Example API Route)
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { CreateTransactionForm } from '@/types/transaction';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conditions = [];
    const values = [];
    let valueIndex = 1;

    for (const [key, value] of searchParams.entries()) {
        if (['id', 'type', 'amount', 'category_id', 'description', 'date'].includes(key)) {
            conditions.push(`${key} = $${valueIndex}`);
            values.push(value);
            valueIndex++;
        }
    }
    const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';
    const orderClause = searchParams.get("order") || "";

    const query = `SELECT t.id, t.type, t.amount, t.category_id, t.description, t.date, d.id as debt_id, d.amount as debt_amount, d.status as debt_status, d.person as debt_person, d.description as debt_description FROM transactions t LEFT JOIN debts d ON t.id = d.transaction_id ${whereClause} ${orderClause}`;
    const result = await pool.query(query, values);

    const transactions = result.rows.reduce((acc, row) => {
      // Find if transaction already exists in our accumulator
      let transaction = acc.find((t: any) => t.id === row.id);
      
      if (!transaction) {
        transaction = { ...row, debts: [] };
        delete transaction.debt_id; 
        delete transaction.debt_amount;
        delete transaction.debt_status;
        delete transaction.debt_person;
        acc.push(transaction);
      }

      if (row.debt_id) {
        transaction.debts.push({ id: row.debt_id, amount: row.debt_amount, status: row.debt_status, person: row.debt_person, description: row.debt_description });
      }
      
      return acc;
    }, []);

    console.log("transactions: ", transactions);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { type, amount, category_id, description, date } = await request.json() as CreateTransactionForm;
  console.log("type", type, "category_id", category_id);
  const client = await pool.connect(); // Get a dedicated client from the pool

  try {
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO transactions (type, amount, category_id, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *;;';
    const insertResult = await client.query(insertQuery, [type, amount, category_id, description, date]);

    const createdTransaction = insertResult.rows[0];

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Transaction registered successfully", data: createdTransaction });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error, request);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('id');
  const { type, amount, category_id, description, date } = await request.json() as CreateTransactionForm;
  console.log("type", type, "category_id", category_id);
  const client = await pool.connect(); // Get a dedicated client from the pool

  try {
    await client.query('BEGIN');

    const updateQuery = 'UPDATE transactions SET type = $1, amount = $2, category_id = $3, description = $4, date = $5 where id = $6 RETURNING *;';
    const updateResult = await client.query(updateQuery, [type, amount, category_id, description, date, transactionId]);

    const updatedTransaction = updateResult.rows[0];

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Transaction updated successfully", data: updatedTransaction });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error, request);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('id');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const deleteQuery = 'DELETE FROM transactions WHERE id = $1';
    const deleteResult = await client.query(deleteQuery, [transactionId]);

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, message: "Transaction Not Found" }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}