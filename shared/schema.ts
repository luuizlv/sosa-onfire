import { pgTable, uuid, varchar, text, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the bet type enum
export const betTypeEnum = pgEnum('bet_type', [
  'surebet',
  'giros',
  'superodd',
  'dnc',
  'gastos',
  'bingos',
  'extracao',
  'vicio'
]);

// Define the bet status enum
export const betStatusEnum = pgEnum('bet_status', [
  'pending',
  'completed',
  'lost'
]);

// Users table for Supabase Auth integration
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Supabase Auth UUID
  email: varchar('email', { length: 255 }).unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bets table
export const bets = pgTable('bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stake: decimal('stake', { precision: 12, scale: 2 }).notNull(),
  payout: decimal('payout', { precision: 12, scale: 2 }).notNull(),
  betType: betTypeEnum('bet_type').notNull(),
  status: betStatusEnum('status').default('pending').notNull(),
  house: varchar('house', { length: 100 }),
  description: text('description'),
  placedAt: timestamp('placed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = Omit<typeof bets.$inferInsert, 'placedAt'> & { placedAt: string };
export type UpdateBet = Partial<InsertBet> & { id: string };

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  stake: z.string().min(1, "Valor da aposta é obrigatório"),
  payout: z.string().optional().default("0"),
  betType: z.enum(['surebet', 'giros', 'superodd', 'dnc', 'gastos', 'bingos', 'extracao', 'vicio']),
  placedAt: z.string().min(1, "Data da aposta é obrigatória"),
});

export const updateBetSchema = insertBetSchema.partial().extend({
  id: z.string().uuid(),
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBetForm = z.infer<typeof insertBetSchema>;