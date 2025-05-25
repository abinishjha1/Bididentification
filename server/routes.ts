import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertEmailRecordSchema,
  insertContractorSchema,
  insertProjectSchema,
  insertBidSchema,
  insertClassificationSchema,
  insertBidClassificationSchema,
  insertBidDocumentSchema,
  insertContractSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleError = (err: unknown, res: Response) => {
    console.error("API Error:", err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    
    return res.status(500).json({ 
      message: err instanceof Error ? err.message : "Internal server error" 
    });
  };

  // Email Record Endpoints
  app.get("/api/emails", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const emails = await storage.getEmailRecords(limit);
      res.json(emails);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/emails/unprocessed", async (req, res) => {
    try {
      const emails = await storage.getUnprocessedEmails();
      res.json(emails);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/emails/:id", async (req, res) => {
    try {
      const email = await storage.getEmailRecordById(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      // Convert string date to Date object before validation
      const requestData = { ...req.body };
      
      if (requestData.received_date && typeof requestData.received_date === 'string') {
        requestData.received_date = new Date(requestData.received_date);
      }
      
      const emailData = insertEmailRecordSchema.parse(requestData);
      const newEmail = await storage.createEmailRecord(emailData);
      res.status(201).json(newEmail);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/emails/:id", async (req, res) => {
    try {
      const emailData = insertEmailRecordSchema.partial().parse(req.body);
      const updatedEmail = await storage.updateEmailRecord(req.params.id, emailData);
      if (!updatedEmail) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(updatedEmail);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Contractor Endpoints
  app.get("/api/contractors", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const contractors = await storage.getContractors(limit);
      res.json(contractors);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const contractor = await storage.getContractorById(req.params.id);
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.json(contractor);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/contractors", async (req, res) => {
    try {
      const contractorData = insertContractorSchema.parse(req.body);
      const newContractor = await storage.createContractor(contractorData);
      res.status(201).json(newContractor);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/contractors/:id", async (req, res) => {
    try {
      const contractorData = insertContractorSchema.partial().parse(req.body);
      const updatedContractor = await storage.updateContractor(req.params.id, contractorData);
      if (!updatedContractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.json(updatedContractor);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/contractors/:id", async (req, res) => {
    try {
      const success = await storage.deleteContractor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Project Endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const projects = await storage.getProjects(limit);
      res.json(projects);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/projects/active", async (req, res) => {
    try {
      const projects = await storage.getActiveProjects();
      res.json(projects);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Bid Endpoints
  app.get("/api/bids", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const bids = await storage.getBids(limit);
      res.json(bids);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/bids/:id", async (req, res) => {
    try {
      const bid = await storage.getBidById(req.params.id);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      res.json(bid);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/projects/:projectId/bids", async (req, res) => {
    try {
      const bids = await storage.getBidsByProjectId(req.params.projectId);
      res.json(bids);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/contractors/:contractorId/bids", async (req, res) => {
    try {
      const bids = await storage.getBidsByContractorId(req.params.contractorId);
      res.json(bids);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      const newBid = await storage.createBid(bidData);
      res.status(201).json(newBid);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/bids/:id", async (req, res) => {
    try {
      const bidData = insertBidSchema.partial().parse(req.body);
      const updatedBid = await storage.updateBid(req.params.id, bidData);
      if (!updatedBid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      res.json(updatedBid);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/bids/:id", async (req, res) => {
    try {
      const success = await storage.deleteBid(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Bid not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Classification Endpoints
  app.get("/api/classifications", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const classifications = await storage.getClassifications(limit);
      res.json(classifications);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/classifications/category/:category", async (req, res) => {
    try {
      const classifications = await storage.getClassificationsByCategory(req.params.category);
      res.json(classifications);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/classifications", async (req, res) => {
    try {
      const classificationData = insertClassificationSchema.parse(req.body);
      const newClassification = await storage.createClassification(classificationData);
      res.status(201).json(newClassification);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/classifications/:id", async (req, res) => {
    try {
      const classificationData = insertClassificationSchema.partial().parse(req.body);
      const updatedClassification = await storage.updateClassification(req.params.id, classificationData);
      if (!updatedClassification) {
        return res.status(404).json({ message: "Classification not found" });
      }
      res.json(updatedClassification);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/classifications/:id", async (req, res) => {
    try {
      const success = await storage.deleteClassification(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Classification not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Bid Classification Endpoints
  app.get("/api/bids/:bidId/classifications", async (req, res) => {
    try {
      const classifications = await storage.getBidClassifications(req.params.bidId);
      res.json(classifications);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/bid-classifications", async (req, res) => {
    try {
      const bidClassificationData = insertBidClassificationSchema.parse(req.body);
      const newBidClassification = await storage.addBidClassification(bidClassificationData);
      res.status(201).json(newBidClassification);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/bid-classifications/:id", async (req, res) => {
    try {
      const success = await storage.removeBidClassification(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Bid classification not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Bid Document Endpoints
  app.get("/api/bids/:bidId/documents", async (req, res) => {
    try {
      const documents = await storage.getBidDocuments(req.params.bidId);
      res.json(documents);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/bid-documents", async (req, res) => {
    try {
      const bidDocumentData = insertBidDocumentSchema.parse(req.body);
      const newBidDocument = await storage.addBidDocument(bidDocumentData);
      res.status(201).json(newBidDocument);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/bid-documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteBidDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Bid document not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Contract Endpoints
  app.get("/api/contracts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const contracts = await storage.getContracts(limit);
      res.json(contracts);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const contract = await storage.getContractById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/bids/:bidId/contract", async (req, res) => {
    try {
      const contract = await storage.getContractByBidId(req.params.bidId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found for this bid" });
      }
      res.json(contract);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const newContract = await storage.createContract(contractData);
      res.status(201).json(newContract);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const contractData = insertContractSchema.partial().parse(req.body);
      const updatedContract = await storage.updateContract(req.params.id, contractData);
      if (!updatedContract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(updatedContract);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContract(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Dashboard Endpoints
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json(summary);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/dashboard/email-stats", async (req, res) => {
    try {
      const stats = await storage.getEmailClassificationStats();
      res.json(stats);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Search Endpoints
  app.get("/api/search/emails", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.searchEmails(query);
      res.json(results);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/search/contractors", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.searchContractors(query);
      res.json(results);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/search/projects", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.searchProjects(query);
      res.json(results);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/search/bids", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.searchBids(query);
      res.json(results);
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
