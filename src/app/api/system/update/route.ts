import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    // Check for updates via git
    execSync('git fetch origin master');
    const local = execSync('git rev-parse HEAD').toString().trim();
    const remote = execSync('git rev-parse origin/master').toString().trim();
    const upToDate = local === remote;
    
    return NextResponse.json({ 
      upToDate,
      version: local.substring(0, 7)
    });
  } catch (error) {
    console.error('Update check error:', error);
    return NextResponse.json({ error: 'Failed to check for updates' }, { status: 500 });
  }
}
