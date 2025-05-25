import { pgTable, text, serial, integer, boolean, timestamp, numeric, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const emailTypeEnum = pgEnum('email_type', [
  'bid_submission',
  'bid_inquiry',
  'follow_up',
  'contract_related',
  'project_update',
  'general_inquiry',
  'unknown'
]);

export const bidStatusEnum = pgEnum('bid_status', [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'contract_pending',
  'contract_signed',
  'withdrawn'
]);

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'completed',
  'cancelled',
  'on_hold'
]);

export const processingStatusEnum = pgEnum('processing_status', [
  'unprocessed',
  'processing',
  'processed',
  'failed',
  'needs_review'
]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emailRecords = pgTable("email_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: text("subject").notNull(),
  sender_email: text("sender_email").notNull(),
  sender_name: text("sender_name"),
  recipient_email: text("recipient_email").notNull(),
  received_date: timestamp("received_date", { withTimezone: true }).notNull().defaultNow(),
  body_text: text("body_text"),
  email_type: emailTypeEnum("email_type").default('unknown'),
  is_processed: boolean("is_processed").default(false),
  processing_status: processingStatusEnum("processing_status").default('unprocessed'),
  extracted_data: text("extracted_data"), // JSON string of extracted data
});

export const contractors = pgTable("contractors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  certification_level: text("certification_level"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  project_type: text("project_type"),
  budget_range: text("budget_range"),
  start_date: text("start_date"),
  end_date: text("end_date"),
  status: projectStatusEnum("status").default('active'),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bids = pgTable("bids", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id").references(() => projects.id),
  contractor_id: uuid("contractor_id").references(() => contractors.id),
  email_record_id: uuid("email_record_id").references(() => emailRecords.id),
  bid_amount: numeric("bid_amount", { precision: 12, scale: 2 }),
  submission_date: timestamp("submission_date", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  status: bidStatusEnum("status").default('submitted'),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classifications = pgTable("classifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // email_type, value_range, project_type, etc.
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bidClassifications = pgTable("bid_classifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  bid_id: uuid("bid_id").references(() => bids.id),
  classification_id: uuid("classification_id").references(() => classifications.id),
  confidence_score: numeric("confidence_score", { precision: 5, scale: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bidDocuments = pgTable("bid_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  bid_id: uuid("bid_id").references(() => bids.id),
  document_name: text("document_name").notNull(),
  document_url: text("document_url").notNull(),
  document_type: text("document_type"),
  uploaded_at: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  bid_id: uuid("bid_id").references(() => bids.id),
  contract_number: text("contract_number"),
  contract_amount: numeric("contract_amount", { precision: 12, scale: 2 }),
  start_date: text("start_date"),
  end_date: text("end_date"),
  status: text("status").default('draft'),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const emailRecordsRelations = relations(emailRecords, ({ many }) => ({
  bids: many(bids),
}));

export const contractorsRelations = relations(contractors, ({ many }) => ({
  bids: many(bids),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one, many }) => ({
  project: one(projects, {
    fields: [bids.project_id],
    references: [projects.id],
  }),
  contractor: one(contractors, {
    fields: [bids.contractor_id],
    references: [contractors.id],
  }),
  emailRecord: one(emailRecords, {
    fields: [bids.email_record_id],
    references: [emailRecords.id],
  }),
  classifications: many(bidClassifications),
  documents: many(bidDocuments),
  contract: many(contracts),
}));

export const classificationsRelations = relations(classifications, ({ many }) => ({
  bidClassifications: many(bidClassifications),
}));

export const bidClassificationsRelations = relations(bidClassifications, ({ one }) => ({
  bid: one(bids, {
    fields: [bidClassifications.bid_id],
    references: [bids.id],
  }),
  classification: one(classifications, {
    fields: [bidClassifications.classification_id],
    references: [classifications.id],
  }),
}));

export const bidDocumentsRelations = relations(bidDocuments, ({ one }) => ({
  bid: one(bids, {
    fields: [bidDocuments.bid_id],
    references: [bids.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  bid: one(bids, {
    fields: [contracts.bid_id],
    references: [bids.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmailRecordSchema = createInsertSchema(emailRecords).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  });

export const insertBidSchema = createInsertSchema(bids)
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    bid_amount: z.string().or(z.number()).transform(val => 
      typeof val === 'number' ? val.toString() : val),
    email_record_id: z.string().optional().nullable(),
  });

export const insertClassificationSchema = createInsertSchema(classifications).omit({
  id: true,
  created_at: true,
});

export const insertBidClassificationSchema = createInsertSchema(bidClassifications).omit({
  id: true,
  created_at: true,
});

export const insertBidDocumentSchema = createInsertSchema(bidDocuments).omit({
  id: true,
  uploaded_at: true,
});

export const insertContractSchema = createInsertSchema(contracts)
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    contract_amount: z.string().or(z.number()).transform(val => 
      typeof val === 'number' ? val.toString() : val),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmailRecord = z.infer<typeof insertEmailRecordSchema>;
export type EmailRecord = typeof emailRecords.$inferSelect;

export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Contractor = typeof contractors.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;

export type InsertClassification = z.infer<typeof insertClassificationSchema>;
export type Classification = typeof classifications.$inferSelect;

export type InsertBidClassification = z.infer<typeof insertBidClassificationSchema>;
export type BidClassification = typeof bidClassifications.$inferSelect;

export type InsertBidDocument = z.infer<typeof insertBidDocumentSchema>;
export type BidDocument = typeof bidDocuments.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// Extended types with relations
export type BidWithRelations = Bid & {
  project?: Project;
  contractor?: Contractor;
  emailRecord?: EmailRecord;
  classifications?: (BidClassification & { classification: Classification })[];
  documents?: BidDocument[];
  contract?: Contract[];
};

export type EmailRecordWithBid = EmailRecord & {
  bid?: Bid;
};

export type ProjectWithBids = Project & {
  bids?: Bid[];
};

export type ContractorWithBids = Contractor & {
  bids?: Bid[];
};
