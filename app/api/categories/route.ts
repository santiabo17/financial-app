import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { TYPE_ENUM, TYPE_TEXT_ENUM } from '@/types/transaction';
// import { CATEGORY_ENUM } from '@/types/category';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeSearch = searchParams.get('type');
    const type = typeSearch == TYPE_TEXT_ENUM.INCOME ? "false" : typeSearch == TYPE_TEXT_ENUM.OUTCOME ? "true" : false;

    const query = type != false ? 
      'SELECT id, name, type, color FROM categories WHERE type = $1' : 
      'SELECT id, name, type, color FROM categories';
    const result = await pool.query(query, type != false ? [type] : []);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, type, color } = await request.json();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO categories (name, type, color) VALUES ($1, $2, $3) RETURNING *;;';
    const insertResult = await client.query(insertQuery, [name, type, color]);
    const createdCategory = insertResult.rows[0];

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Category inserted successfully", data: createdCategory });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('id');
  const { name, type, color } = await request.json();
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start the transaction

    const updateQuery = 'UPDATE categories SET name = $1, type = $2, color = $3 WHERE id = $4';
    const updateResult = await client.query(updateQuery, [name, type, color, categoryId]);

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: "Category Not Found" }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Category updated successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('id');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const deleteQuery = 'DELETE FROM categories WHERE id = $1';
    const deleteResult = await client.query(deleteQuery, [categoryId]);

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: "Category Not Found" }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Category deleted successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction failed:", error);
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });

  } finally {
    client.release();
  }
}