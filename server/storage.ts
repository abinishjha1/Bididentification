import { 
  users, type User, type InsertUser,
  emailRecords, type EmailRecord, type InsertEmailRecord,
  contractors, type Contractor, type InsertContractor,
  projects, type Project, type InsertProject,
  bids, type Bid, type InsertBid,
  classifications, type Classification, type InsertClassification,
  bidClassifications, type BidClassification, type InsertBidClassification,
  bidDocuments, type BidDocument, type InsertBidDocument,
  contracts, type Contract, type InsertContract,
  type BidWithRelations, type EmailRecordWithBid, type ProjectWithBids, type ContractorWithBids
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, like, ilike, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Email operations
  createEmailRecord(email: InsertEmailRecord): Promise<EmailRecord>;
  getEmailRecords(limit?: number): Promise<EmailRecord[]>;
  getEmailRecordById(id: string): Promise<EmailRecord | undefined>;
  updateEmailRecord(id: string, data: Partial<InsertEmailRecord>): Promise<EmailRecord | undefined>;
  getUnprocessedEmails(): Promise<EmailRecord[]>;
  searchEmails(query: string): Promise<EmailRecord[]>;

  // Contractor operations
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  getContractors(limit?: number): Promise<Contractor[]>;
  getContractorById(id: string): Promise<Contractor | undefined>;
  updateContractor(id: string, data: Partial<InsertContractor>): Promise<Contractor | undefined>;
  deleteContractor(id: string): Promise<boolean>;
  getContractorByEmail(email: string): Promise<Contractor | undefined>;
  searchContractors(query: string): Promise<Contractor[]>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(limit?: number): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getActiveProjects(): Promise<Project[]>;
  searchProjects(query: string): Promise<Project[]>;

  // Bid operations
  createBid(bid: InsertBid): Promise<Bid>;
  getBids(limit?: number): Promise<BidWithRelations[]>;
  getBidById(id: string): Promise<BidWithRelations | undefined>;
  updateBid(id: string, data: Partial<InsertBid>): Promise<Bid | undefined>;
  deleteBid(id: string): Promise<boolean>;
  getBidsByProjectId(projectId: string): Promise<BidWithRelations[]>;
  getBidsByContractorId(contractorId: string): Promise<BidWithRelations[]>;
  searchBids(query: string): Promise<BidWithRelations[]>;

  // Classification operations
  createClassification(classification: InsertClassification): Promise<Classification>;
  getClassifications(limit?: number): Promise<Classification[]>;
  getClassificationById(id: string): Promise<Classification | undefined>;
  getClassificationsByCategory(category: string): Promise<Classification[]>;
  updateClassification(id: string, data: Partial<InsertClassification>): Promise<Classification | undefined>;
  deleteClassification(id: string): Promise<boolean>;

  // Bid Classification operations
  addBidClassification(bidClassification: InsertBidClassification): Promise<BidClassification>;
  getBidClassifications(bidId: string): Promise<(BidClassification & { classification: Classification })[]>;
  removeBidClassification(id: string): Promise<boolean>;

  // Bid Document operations
  addBidDocument(document: InsertBidDocument): Promise<BidDocument>;
  getBidDocuments(bidId: string): Promise<BidDocument[]>;
  deleteBidDocument(id: string): Promise<boolean>;

  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContracts(limit?: number): Promise<Contract[]>;
  getContractById(id: string): Promise<Contract | undefined>;
  updateContract(id: string, data: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getContractByBidId(bidId: string): Promise<Contract | undefined>;

  // Dashboard operations
  getDashboardSummary(): Promise<{
    activeBids: number;
    unprocessedEmails: number;
    activeProjects: number;
    totalContractValue: number;
  }>;
  getEmailClassificationStats(): Promise<{
    category: string;
    count: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  // Email operations
  async createEmailRecord(email: InsertEmailRecord): Promise<EmailRecord> {
    const [newEmail] = await db
      .insert(emailRecords)
      .values(email)
      .returning();
    return newEmail;
  }

  async getEmailRecords(limit = 100): Promise<EmailRecord[]> {
    return await db
      .select()
      .from(emailRecords)
      .orderBy(desc(emailRecords.received_date))
      .limit(limit);
  }

  async getEmailRecordById(id: string): Promise<EmailRecord | undefined> {
    const [email] = await db
      .select()
      .from(emailRecords)
      .where(eq(emailRecords.id, id));
    return email;
  }

  async updateEmailRecord(id: string, data: Partial<InsertEmailRecord>): Promise<EmailRecord | undefined> {
    const [updatedEmail] = await db
      .update(emailRecords)
      .set(data)
      .where(eq(emailRecords.id, id))
      .returning();
    return updatedEmail;
  }

  async getUnprocessedEmails(): Promise<EmailRecord[]> {
    return await db
      .select()
      .from(emailRecords)
      .where(eq(emailRecords.is_processed, false))
      .orderBy(desc(emailRecords.received_date));
  }

  async searchEmails(query: string): Promise<EmailRecord[]> {
    return await db
      .select()
      .from(emailRecords)
      .where(
        or(
          ilike(emailRecords.subject, `%${query}%`),
          ilike(emailRecords.sender_email, `%${query}%`),
          ilike(emailRecords.sender_name || '', `%${query}%`),
          ilike(emailRecords.body_text || '', `%${query}%`)
        )
      )
      .orderBy(desc(emailRecords.received_date));
  }

  // Contractor operations
  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db
      .insert(contractors)
      .values(contractor)
      .returning();
    return newContractor;
  }

  async getContractors(limit = 100): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .orderBy(contractors.name)
      .limit(limit);
  }

  async getContractorById(id: string): Promise<Contractor | undefined> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, id));
    return contractor;
  }

  async updateContractor(id: string, data: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [updatedContractor] = await db
      .update(contractors)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(contractors.id, id))
      .returning();
    return updatedContractor;
  }

  async deleteContractor(id: string): Promise<boolean> {
    const result = await db
      .delete(contractors)
      .where(eq(contractors.id, id))
      .returning({ id: contractors.id });
    return result.length > 0;
  }

  async getContractorByEmail(email: string): Promise<Contractor | undefined> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.email, email));
    return contractor;
  }

  async searchContractors(query: string): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(
        or(
          ilike(contractors.name, `%${query}%`),
          ilike(contractors.email, `%${query}%`),
          ilike(contractors.phone || '', `%${query}%`),
          ilike(contractors.certification_level || '', `%${query}%`)
        )
      )
      .orderBy(contractors.name);
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProjects(limit = 100): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(projects.name)
      .limit(limit);
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    return result.length > 0;
  }

  async getActiveProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.status, 'active'))
      .orderBy(projects.name);
  }

  async searchProjects(query: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(
        or(
          ilike(projects.name, `%${query}%`),
          ilike(projects.description || '', `%${query}%`),
          ilike(projects.project_type || '', `%${query}%`)
        )
      )
      .orderBy(projects.name);
  }

  // Bid operations
  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db
      .insert(bids)
      .values(bid)
      .returning();
    return newBid;
  }

  async getBids(limit = 100): Promise<BidWithRelations[]> {
    const rawBids = await db
      .select()
      .from(bids)
      .orderBy(desc(bids.submission_date))
      .limit(limit);

    return await this.populateBidRelations(rawBids);
  }

  async getBidById(id: string): Promise<BidWithRelations | undefined> {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, id));

    if (!bid) return undefined;
    
    const bidsWithRelations = await this.populateBidRelations([bid]);
    return bidsWithRelations[0];
  }

  async updateBid(id: string, data: Partial<InsertBid>): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async deleteBid(id: string): Promise<boolean> {
    const result = await db
      .delete(bids)
      .where(eq(bids.id, id))
      .returning({ id: bids.id });
    return result.length > 0;
  }

  async getBidsByProjectId(projectId: string): Promise<BidWithRelations[]> {
    const rawBids = await db
      .select()
      .from(bids)
      .where(eq(bids.project_id, projectId))
      .orderBy(desc(bids.submission_date));

    return await this.populateBidRelations(rawBids);
  }

  async getBidsByContractorId(contractorId: string): Promise<BidWithRelations[]> {
    const rawBids = await db
      .select()
      .from(bids)
      .where(eq(bids.contractor_id, contractorId))
      .orderBy(desc(bids.submission_date));

    return await this.populateBidRelations(rawBids);
  }

  async searchBids(query: string): Promise<BidWithRelations[]> {
    // First, search for projects and contractors matching the query
    const matchingProjects = await this.searchProjects(query);
    const matchingContractors = await this.searchContractors(query);
    
    // Get IDs
    const projectIds = matchingProjects.map(p => p.id);
    const contractorIds = matchingContractors.map(c => c.id);
    
    // Get bids that match either project, contractor, or have notes containing the query
    const rawBids = await db
      .select()
      .from(bids)
      .where(
        or(
          projectIds.length > 0 ? inArray(bids.project_id, projectIds) : sql`FALSE`,
          contractorIds.length > 0 ? inArray(bids.contractor_id, contractorIds) : sql`FALSE`,
          ilike(bids.notes || '', `%${query}%`)
        )
      )
      .orderBy(desc(bids.submission_date));

    return await this.populateBidRelations(rawBids);
  }

  // Helper method to populate bid relations
  private async populateBidRelations(bids: Bid[]): Promise<BidWithRelations[]> {
    if (bids.length === 0) return [];

    const bidIds = bids.map(b => b.id);
    const projectIds = bids.map(b => b.project_id).filter(Boolean) as string[];
    const contractorIds = bids.map(b => b.contractor_id).filter(Boolean) as string[];
    const emailIds = bids.map(b => b.email_record_id).filter(Boolean) as string[];

    // Get related projects
    const relatedProjects = projectIds.length > 0 
      ? await db.select().from(projects).where(inArray(projects.id, projectIds))
      : [];
    
    // Get related contractors
    const relatedContractors = contractorIds.length > 0
      ? await db.select().from(contractors).where(inArray(contractors.id, contractorIds))
      : [];
    
    // Get related emails
    const relatedEmails = emailIds.length > 0
      ? await db.select().from(emailRecords).where(inArray(emailRecords.id, emailIds))
      : [];
    
    // Get related classifications
    const bidClassificationsData = bidIds.length > 0
      ? await db
          .select()
          .from(bidClassifications)
          .where(inArray(bidClassifications.bid_id, bidIds))
      : [];
    
    // Get classification IDs
    const classificationIds = bidClassificationsData.map(bc => bc.classification_id);
    
    // Get classifications
    const classificationsData = classificationIds.length > 0
      ? await db
          .select()
          .from(classifications)
          .where(inArray(classifications.id, classificationIds))
      : [];
    
    // Get documents
    const documentsData = bidIds.length > 0
      ? await db
          .select()
          .from(bidDocuments)
          .where(inArray(bidDocuments.bid_id, bidIds))
      : [];
    
    // Get contracts
    const contractsData = bidIds.length > 0
      ? await db
          .select()
          .from(contracts)
          .where(inArray(contracts.bid_id, bidIds))
      : [];

    // Create lookup maps
    const projectMap = new Map(relatedProjects.map(p => [p.id, p]));
    const contractorMap = new Map(relatedContractors.map(c => [c.id, c]));
    const emailMap = new Map(relatedEmails.map(e => [e.id, e]));
    const classificationMap = new Map(classificationsData.map(c => [c.id, c]));
    
    // Group bid classifications by bid_id
    const bidClassificationMap = new Map<string, (BidClassification & { classification: Classification })[]>();
    bidClassificationsData.forEach(bc => {
      const classification = classificationMap.get(bc.classification_id);
      if (classification) {
        const entry = { ...bc, classification };
        const existing = bidClassificationMap.get(bc.bid_id) || [];
        existing.push(entry);
        bidClassificationMap.set(bc.bid_id, existing);
      }
    });
    
    // Group documents by bid_id
    const documentsMap = new Map<string, BidDocument[]>();
    documentsData.forEach(doc => {
      const existing = documentsMap.get(doc.bid_id) || [];
      existing.push(doc);
      documentsMap.set(doc.bid_id, existing);
    });
    
    // Group contracts by bid_id
    const contractsMap = new Map<string, Contract[]>();
    contractsData.forEach(contract => {
      const existing = contractsMap.get(contract.bid_id) || [];
      existing.push(contract);
      contractsMap.set(contract.bid_id, existing);
    });

    // Populate relations
    return bids.map(bid => {
      return {
        ...bid,
        project: bid.project_id ? projectMap.get(bid.project_id) : undefined,
        contractor: bid.contractor_id ? contractorMap.get(bid.contractor_id) : undefined,
        emailRecord: bid.email_record_id ? emailMap.get(bid.email_record_id) : undefined,
        classifications: bidClassificationMap.get(bid.id) || [],
        documents: documentsMap.get(bid.id) || [],
        contract: contractsMap.get(bid.id) || [],
      };
    });
  }

  // Classification operations
  async createClassification(classification: InsertClassification): Promise<Classification> {
    const [newClassification] = await db
      .insert(classifications)
      .values(classification)
      .returning();
    return newClassification;
  }

  async getClassifications(limit = 100): Promise<Classification[]> {
    return await db
      .select()
      .from(classifications)
      .orderBy(classifications.category, classifications.name)
      .limit(limit);
  }

  async getClassificationById(id: string): Promise<Classification | undefined> {
    const [classification] = await db
      .select()
      .from(classifications)
      .where(eq(classifications.id, id));
    return classification;
  }

  async getClassificationsByCategory(category: string): Promise<Classification[]> {
    return await db
      .select()
      .from(classifications)
      .where(eq(classifications.category, category))
      .orderBy(classifications.name);
  }

  async updateClassification(id: string, data: Partial<InsertClassification>): Promise<Classification | undefined> {
    const [updatedClassification] = await db
      .update(classifications)
      .set(data)
      .where(eq(classifications.id, id))
      .returning();
    return updatedClassification;
  }

  async deleteClassification(id: string): Promise<boolean> {
    const result = await db
      .delete(classifications)
      .where(eq(classifications.id, id))
      .returning({ id: classifications.id });
    return result.length > 0;
  }

  // Bid Classification operations
  async addBidClassification(bidClassification: InsertBidClassification): Promise<BidClassification> {
    const [newBidClassification] = await db
      .insert(bidClassifications)
      .values(bidClassification)
      .returning();
    return newBidClassification;
  }

  async getBidClassifications(bidId: string): Promise<(BidClassification & { classification: Classification })[]> {
    const result = await db
      .select({
        bidClassification: bidClassifications,
        classification: classifications
      })
      .from(bidClassifications)
      .innerJoin(
        classifications,
        eq(bidClassifications.classification_id, classifications.id)
      )
      .where(eq(bidClassifications.bid_id, bidId));
    
    return result.map(r => ({
      ...r.bidClassification,
      classification: r.classification
    }));
  }

  async removeBidClassification(id: string): Promise<boolean> {
    const result = await db
      .delete(bidClassifications)
      .where(eq(bidClassifications.id, id))
      .returning({ id: bidClassifications.id });
    return result.length > 0;
  }

  // Bid Document operations
  async addBidDocument(document: InsertBidDocument): Promise<BidDocument> {
    const [newDocument] = await db
      .insert(bidDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async getBidDocuments(bidId: string): Promise<BidDocument[]> {
    return await db
      .select()
      .from(bidDocuments)
      .where(eq(bidDocuments.bid_id, bidId))
      .orderBy(desc(bidDocuments.uploaded_at));
  }

  async deleteBidDocument(id: string): Promise<boolean> {
    const result = await db
      .delete(bidDocuments)
      .where(eq(bidDocuments.id, id))
      .returning({ id: bidDocuments.id });
    return result.length > 0;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values(contract)
      .returning();
    return newContract;
  }

  async getContracts(limit = 100): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .orderBy(desc(contracts.created_at))
      .limit(limit);
  }

  async getContractById(id: string): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    return contract;
  }

  async updateContract(id: string, data: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await db
      .delete(contracts)
      .where(eq(contracts.id, id))
      .returning({ id: contracts.id });
    return result.length > 0;
  }

  async getContractByBidId(bidId: string): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.bid_id, bidId));
    return contract;
  }

  // Dashboard operations
  async getDashboardSummary(): Promise<{
    activeBids: number;
    unprocessedEmails: number;
    activeProjects: number;
    totalContractValue: number;
  }> {
    // Get active bids count
    const [activeBidsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bids)
      .where(
        inArray(
          bids.status, 
          ['submitted', 'under_review', 'approved', 'contract_pending']
        )
      );
    
    // Get unprocessed emails count
    const [unprocessedEmailsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailRecords)
      .where(eq(emailRecords.is_processed, false));
    
    // Get active projects count
    const [activeProjectsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.status, 'active'));
    
    // Get total contract value
    const [totalContractValueResult] = await db
      .select({ 
        sum: sql<string>`COALESCE(SUM(contract_amount), 0)` 
      })
      .from(contracts);
    
    return {
      activeBids: activeBidsResult?.count || 0,
      unprocessedEmails: unprocessedEmailsResult?.count || 0,
      activeProjects: activeProjectsResult?.count || 0,
      totalContractValue: parseFloat(totalContractValueResult?.sum || '0')
    };
  }

  async getEmailClassificationStats(): Promise<{
    category: string;
    count: number;
  }[]> {
    const result = await db
      .select({
        category: emailRecords.email_type,
        count: sql<number>`count(*)`
      })
      .from(emailRecords)
      .groupBy(emailRecords.email_type)
      .orderBy(desc(sql<number>`count(*)`));

    return result.map(r => ({
      category: r.category || 'unclassified',
      count: r.count
    }));
  }
}

// Helper function for OR conditions since drizzle-orm doesn't expose 'or' directly
function or(...conditions: any[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}

export const storage = new DatabaseStorage();
