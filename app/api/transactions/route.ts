// app/api/products/route.ts (Example API Route)
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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

    const query = `SELECT id, type, amount, category_id, description, date FROM transactions ${whereClause}`;
    const result = await pool.query(query, values);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { type, amount, category_id, description, date } = await request.json();
  const client = await pool.connect(); // Get a dedicated client from the pool

  try {
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO transactions (type, amount, category_id, description, date) VALUES ($1, $2, $3, $4, $5);';
    const insertResult = await client.query(insertQuery, [type, amount, category_id, description, date]);

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Transaction registered successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}