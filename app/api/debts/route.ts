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
        if (['id', 'type', 'amount', 'category_id', 'transaction_id', 'person', 'description', 'date', 'status'].includes(key)) {
            conditions.push(`${key} = $${valueIndex}`);
            values.push(value);
            valueIndex++;
        }
    }
    const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

    const query = `SELECT id, type, amount, category_id, transaction_id, person, description, date, status FROM debts ${whereClause}`;
    const result = await pool.query(query, values);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { type, amount, category_id, description, date } = await request.json() as CreateTransactionForm;
  const client = await pool.connect(); // Get a dedicated client from the pool

  try {
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO transactions (type, amount, category_id, transaction_id, person, description, date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';
    const insertResult = await client.query(insertQuery, [type, amount, category_id, description, date]);

    const createdTransaction = insertResult.rows[0];

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Debt registered successfully", data: createdTransaction });

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

    const deleteQuery = 'DELETE FROM debts WHERE id = $1';
    const deleteResult = await client.query(deleteQuery, [transactionId]);

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, message: "Debt Not Found" }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Debt deleted successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}