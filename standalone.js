/**
 * Bid Beacon Manager - Standalone Version
 * 
 * This single file contains all the code needed to run a simplified version
 * of the Bid Beacon Manager application.
 * 
 * To run:
 * 1. Save this file as "bidbeacon.js"
 * 2. Run with Node.js: node bidbeacon.js
 * 3. Open browser to: http://localhost:3000
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage
let data = {
  emails: [],
  contractors: [],
  projects: [],
  bids: [],
  classifications: [],
  bidClassifications: [],
  contracts: []
};

// Load initial data if file exists
try {
  if (fs.existsSync('./data.json')) {
    const fileData = fs.readFileSync('./data.json', 'utf8');
    data = JSON.parse(fileData);
    console.log('Loaded existing data');
  } else {
    // Create sample data
    initializeSampleData();
    saveData();
    console.log('Created and saved sample data');
  }
} catch (err) {
  console.error('Error loading data:', err);
  initializeSampleData();
}

// Save data to file
function saveData() {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

// Initialize with sample data
function initializeSampleData() {
  // Sample classifications
  const classifications = [
    {
      id: uuidv4(),
      name: 'High Priority',
      category: 'priority',
      description: 'Urgent bids requiring immediate attention',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Medium Priority',
      category: 'priority',
      description: 'Standard priority bids',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Low Priority',
      category: 'priority',
      description: 'Low urgency bids',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Construction',
      category: 'industry',
      description: 'Construction-related bids',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Technology',
      category: 'industry',
      description: 'Technology-related bids',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample contractors
  const contractors = [
    {
      id: uuidv4(),
      name: 'Acme Construction',
      email: 'info@acmeconstruction.com',
      phone: '555-123-4567',
      address: '123 Builder St, Construction City, CC 12345',
      contact_name: 'John Builder',
      notes: 'Reliable contractor for construction projects',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'TechSolutions Inc',
      email: 'contact@techsolutions.com',
      phone: '555-987-6543',
      address: '456 Tech Ave, Innovation City, IC 67890',
      contact_name: 'Sarah Tech',
      notes: 'Specializes in IT infrastructure',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample projects
  const projects = [
    {
      id: uuidv4(),
      name: 'Office Renovation',
      description: 'Complete renovation of the main office space',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 250000,
      status: 'active',
      manager: 'Michael Manager',
      location: 'Headquarters Building',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'IT System Upgrade',
      description: 'Upgrade of company-wide IT infrastructure',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 175000,
      status: 'active',
      manager: 'Teresa Tech',
      location: 'All Locations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample emails
  const emails = [
    {
      id: uuidv4(),
      subject: 'Bid Submission - Office Renovation',
      sender_email: 'info@acmeconstruction.com',
      recipient_email: 'procurement@company.com',
      cc_email: 'manager@company.com',
      received_date: new Date().toISOString(),
      body: 'Please find attached our bid for the office renovation project. Our proposal includes all the requested details and pricing.',
      email_type: 'bid_submission',
      processing_status: 'pending',
      extracted_data: JSON.stringify({
        project: 'Office Renovation',
        bid_amount: 245000,
        timeline: '85 days'
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      subject: 'IT System Upgrade Proposal',
      sender_email: 'contact@techsolutions.com',
      recipient_email: 'procurement@company.com',
      cc_email: 'it@company.com',
      received_date: new Date().toISOString(),
      body: 'We are pleased to submit our bid for the IT System Upgrade project. Our team has extensive experience with similar projects.',
      email_type: 'bid_submission',
      processing_status: 'pending',
      extracted_data: JSON.stringify({
        project: 'IT System Upgrade',
        bid_amount: 168500,
        timeline: '55 days'
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample bids
  const bids = [
    {
      id: uuidv4(),
      project_id: projects[0].id,
      contractor_id: contractors[0].id,
      email_id: emails[0].id,
      amount: 245000,
      submission_date: new Date().toISOString(),
      status: 'under_review',
      notes: 'Comprehensive bid with detailed cost breakdown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      project_id: projects[1].id,
      contractor_id: contractors[1].id,
      email_id: emails[1].id,
      amount: 168500,
      submission_date: new Date().toISOString(),
      status: 'under_review',
      notes: 'Includes hardware and software upgrades',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample contracts
  const contracts = [
    {
      id: uuidv4(),
      bid_id: bids[0].id,
      name: 'Office Renovation Contract',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      value: 245000,
      status: 'draft',
      signed_date: null,
      payment_terms: 'Net 30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Sample bid classifications
  const bidClassifications = [
    {
      id: uuidv4(),
      bid_id: bids[0].id,
      classification_id: classifications[0].id,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bid_id: bids[0].id,
      classification_id: classifications[3].id,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bid_id: bids[1].id,
      classification_id: classifications[1].id,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bid_id: bids[1].id,
      classification_id: classifications[4].id,
      created_at: new Date().toISOString()
    }
  ];
  
  // Assign data
  data.classifications = classifications;
  data.contractors = contractors;
  data.projects = projects;
  data.emails = emails;
  data.bids = bids;
  data.contracts = contracts;
  data.bidClassifications = bidClassifications;
}

// ***************** API ROUTES *****************

// Email routes
app.get('/api/emails', (req, res) => {
  res.json(data.emails);
});

app.get('/api/emails/unprocessed', (req, res) => {
  const unprocessedEmails = data.emails.filter(email => email.processing_status === 'pending');
  res.json(unprocessedEmails);
});

app.get('/api/emails/:id', (req, res) => {
  const email = data.emails.find(e => e.id === req.params.id);
  if (!email) {
    return res.status(404).json({ message: 'Email not found' });
  }
  res.json(email);
});

app.post('/api/emails', (req, res) => {
  const newEmail = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.emails.push(newEmail);
  saveData();
  res.status(201).json(newEmail);
});

app.patch('/api/emails/:id', (req, res) => {
  const index = data.emails.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Email not found' });
  }
  const updatedEmail = {
    ...data.emails[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  data.emails[index] = updatedEmail;
  saveData();
  res.json(updatedEmail);
});

// Contractor routes
app.get('/api/contractors', (req, res) => {
  res.json(data.contractors);
});

app.get('/api/contractors/:id', (req, res) => {
  const contractor = data.contractors.find(c => c.id === req.params.id);
  if (!contractor) {
    return res.status(404).json({ message: 'Contractor not found' });
  }
  res.json(contractor);
});

app.post('/api/contractors', (req, res) => {
  const newContractor = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.contractors.push(newContractor);
  saveData();
  res.status(201).json(newContractor);
});

app.patch('/api/contractors/:id', (req, res) => {
  const index = data.contractors.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Contractor not found' });
  }
  const updatedContractor = {
    ...data.contractors[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  data.contractors[index] = updatedContractor;
  saveData();
  res.json(updatedContractor);
});

// Project routes
app.get('/api/projects', (req, res) => {
  res.json(data.projects);
});

app.get('/api/projects/active', (req, res) => {
  const activeProjects = data.projects.filter(p => p.status === 'active');
  res.json(activeProjects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.projects.push(newProject);
  saveData();
  res.status(201).json(newProject);
});

app.patch('/api/projects/:id', (req, res) => {
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const updatedProject = {
    ...data.projects[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  data.projects[index] = updatedProject;
  saveData();
  res.json(updatedProject);
});

// Bid routes
app.get('/api/bids', (req, res) => {
  // Populate bids with related data
  const bidsWithRelations = data.bids.map(bid => {
    const project = data.projects.find(p => p.id === bid.project_id);
    const contractor = data.contractors.find(c => c.id === bid.contractor_id);
    const email = data.emails.find(e => e.id === bid.email_id);
    const bidClassifications = data.bidClassifications
      .filter(bc => bc.bid_id === bid.id)
      .map(bc => {
        const classification = data.classifications.find(c => c.id === bc.classification_id);
        return { ...bc, classification };
      });
    
    return {
      ...bid,
      project,
      contractor,
      emailRecord: email,
      classifications: bidClassifications
    };
  });
  
  res.json(bidsWithRelations);
});

app.get('/api/bids/:id', (req, res) => {
  const bid = data.bids.find(b => b.id === req.params.id);
  if (!bid) {
    return res.status(404).json({ message: 'Bid not found' });
  }
  
  const project = data.projects.find(p => p.id === bid.project_id);
  const contractor = data.contractors.find(c => c.id === bid.contractor_id);
  const email = data.emails.find(e => e.id === bid.email_id);
  const bidClassifications = data.bidClassifications
    .filter(bc => bc.bid_id === bid.id)
    .map(bc => {
      const classification = data.classifications.find(c => c.id === bc.classification_id);
      return { ...bc, classification };
    });
  
  res.json({
    ...bid,
    project,
    contractor,
    emailRecord: email,
    classifications: bidClassifications
  });
});

app.post('/api/bids', (req, res) => {
  const newBid = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.bids.push(newBid);
  saveData();
  res.status(201).json(newBid);
});

app.patch('/api/bids/:id', (req, res) => {
  const index = data.bids.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Bid not found' });
  }
  const updatedBid = {
    ...data.bids[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  data.bids[index] = updatedBid;
  saveData();
  res.json(updatedBid);
});

// Classification routes
app.get('/api/classifications', (req, res) => {
  res.json(data.classifications);
});

app.post('/api/classifications', (req, res) => {
  const newClassification = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.classifications.push(newClassification);
  saveData();
  res.status(201).json(newClassification);
});

// Bid Classification routes
app.post('/api/bid-classifications', (req, res) => {
  const newBidClassification = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.bidClassifications.push(newBidClassification);
  saveData();
  res.status(201).json(newBidClassification);
});

app.delete('/api/bid-classifications/:id', (req, res) => {
  const index = data.bidClassifications.findIndex(bc => bc.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Bid classification not found' });
  }
  data.bidClassifications.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Contract routes
app.get('/api/contracts', (req, res) => {
  res.json(data.contracts);
});

app.post('/api/contracts', (req, res) => {
  const newContract = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.contracts.push(newContract);
  saveData();
  res.status(201).json(newContract);
});

app.patch('/api/contracts/:id', (req, res) => {
  const index = data.contracts.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Contract not found' });
  }
  const updatedContract = {
    ...data.contracts[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  data.contracts[index] = updatedContract;
  saveData();
  res.json(updatedContract);
});

// Dashboard summary
app.get('/api/dashboard/summary', (req, res) => {
  const activeBids = data.bids.filter(b => 
    b.status === 'under_review' || b.status === 'shortlisted'
  ).length;
  
  const unprocessedEmails = data.emails.filter(e => 
    e.processing_status === 'pending'
  ).length;
  
  const activeProjects = data.projects.filter(p => 
    p.status === 'active'
  ).length;
  
  const totalContractValue = data.contracts
    .filter(c => c.status === 'active' || c.status === 'signed')
    .reduce((sum, contract) => sum + (contract.value || 0), 0);
  
  res.json({
    activeBids: activeBids.toString(),
    unprocessedEmails: unprocessedEmails.toString(),
    activeProjects: activeProjects.toString(),
    totalContractValue: totalContractValue.toString()
  });
});

// Email classification stats
app.get('/api/dashboard/email-stats', (req, res) => {
  const stats = [];
  const emailTypes = ['bid_submission', 'follow_up', 'contract_related', 'bid_inquiry', 'general_inquiry', 'project_update', 'unknown'];
  
  emailTypes.forEach(type => {
    const count = data.emails.filter(e => e.email_type === type).length;
    if (count > 0) {
      stats.push({ category: type, count });
    }
  });
  
  res.json(stats);
});

// Serve the frontend files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  
  // Create a simple HTML page
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bid Beacon Manager</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        h1 {
            color: #2563eb;
            margin: 0;
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border: 1px solid #eee;
        }
        .card h2 {
            margin-top: 0;
            color: #4b5563;
            font-size: 1.2rem;
        }
        .card p {
            font-size: 2rem;
            font-weight: bold;
            color: #2563eb;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f8f9fa;
            color: #4b5563;
            font-weight: 600;
        }
        tr:hover {
            background-color: #f5f7fa;
        }
        .status {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .active {
            background-color: #dcfce7;
            color: #166534;
        }
        .under-review {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #1d4ed8;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            margin-right: 10px;
            border-bottom: 2px solid transparent;
        }
        .tab.active {
            border-bottom: 2px solid #2563eb;
            color: #2563eb;
            font-weight: 500;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .badge {
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-right: 5px;
        }
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="loading">
        <div class="spinner"></div>
    </div>
    
    <div class="container">
        <header>
            <h1>Bid Beacon Manager</h1>
            <button id="refreshButton" class="btn">Refresh Data</button>
        </header>
        
        <div class="dashboard" id="dashboard-stats">
            <!-- Dashboard stats will be loaded here -->
        </div>
        
        <div class="tabs">
            <div class="tab active" data-tab="emails">Emails</div>
            <div class="tab" data-tab="bids">Bids</div>
            <div class="tab" data-tab="projects">Projects</div>
            <div class="tab" data-tab="contractors">Contractors</div>
        </div>
        
        <div id="emails" class="tab-content active">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>Email Management</h2>
                <button id="newEmailButton" class="btn">New Email</button>
            </div>
            <table id="emails-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Sender</th>
                        <th>Type</th>
                        <th>Received Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Email data will be loaded here -->
                </tbody>
            </table>
        </div>
        
        <div id="bids" class="tab-content">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>Bid Management</h2>
                <button id="newBidButton" class="btn">New Bid</button>
            </div>
            <table id="bids-table">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Contractor</th>
                        <th>Amount</th>
                        <th>Submission Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Bid data will be loaded here -->
                </tbody>
            </table>
        </div>
        
        <div id="projects" class="tab-content">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>Project Management</h2>
                <button id="newProjectButton" class="btn">New Project</button>
            </div>
            <table id="projects-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Budget</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Project data will be loaded here -->
                </tbody>
            </table>
        </div>
        
        <div id="contractors" class="tab-content">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>Contractor Management</h2>
                <button id="newContractorButton" class="btn">New Contractor</button>
            </div>
            <table id="contractors-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Contact Person</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Contractor data will be loaded here -->
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        // Show loading spinner
        function showLoading() {
            document.getElementById('loading').style.display = 'flex';
        }
        
        // Hide loading spinner
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }
        
        // Format date string
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
        
        // Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(amount);
        }
        
        // Load dashboard stats
        async function loadDashboardStats() {
            try {
                const response = await fetch('/api/dashboard/summary');
                const data = await response.json();
                
                const dashboardElement = document.getElementById('dashboard-stats');
                dashboardElement.innerHTML = \`
                    <div class="card">
                        <h2>Active Bids</h2>
                        <p>\${data.activeBids}</p>
                    </div>
                    <div class="card">
                        <h2>Unprocessed Emails</h2>
                        <p>\${data.unprocessedEmails}</p>
                    </div>
                    <div class="card">
                        <h2>Active Projects</h2>
                        <p>\${data.activeProjects}</p>
                    </div>
                    <div class="card">
                        <h2>Total Contract Value</h2>
                        <p>\${formatCurrency(parseFloat(data.totalContractValue))}</p>
                    </div>
                \`;
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            }
        }
        
        // Load emails
        async function loadEmails() {
            try {
                const response = await fetch('/api/emails');
                const emails = await response.json();
                
                const tableBody = document.querySelector('#emails-table tbody');
                tableBody.innerHTML = '';
                
                emails.forEach(email => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${email.subject}</td>
                        <td>\${email.sender_email}</td>
                        <td>\${email.email_type.replace('_', ' ')}</td>
                        <td>\${formatDate(email.received_date)}</td>
                        <td><span class="status \${email.processing_status === 'pending' ? 'pending' : 'active'}">\${email.processing_status}</span></td>
                        <td>
                            <button class="btn" onclick="viewEmailDetails('\${email.id}')">View</button>
                        </td>
                    \`;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading emails:', error);
            }
        }
        
        // Load bids
        async function loadBids() {
            try {
                const response = await fetch('/api/bids');
                const bids = await response.json();
                
                const tableBody = document.querySelector('#bids-table tbody');
                tableBody.innerHTML = '';
                
                bids.forEach(bid => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${bid.project ? bid.project.name : 'N/A'}</td>
                        <td>\${bid.contractor ? bid.contractor.name : 'N/A'}</td>
                        <td>\${formatCurrency(bid.amount)}</td>
                        <td>\${formatDate(bid.submission_date)}</td>
                        <td><span class="status under-review">\${bid.status.replace('_', ' ')}</span></td>
                        <td>
                            <button class="btn" onclick="viewBidDetails('\${bid.id}')">View</button>
                        </td>
                    \`;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading bids:', error);
            }
        }
        
        // Load projects
        async function loadProjects() {
            try {
                const response = await fetch('/api/projects');
                const projects = await response.json();
                
                const tableBody = document.querySelector('#projects-table tbody');
                tableBody.innerHTML = '';
                
                projects.forEach(project => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${project.name}</td>
                        <td>\${formatCurrency(project.budget)}</td>
                        <td>\${formatDate(project.start_date)}</td>
                        <td>\${formatDate(project.end_date)}</td>
                        <td><span class="status \${project.status === 'active' ? 'active' : 'pending'}">\${project.status}</span></td>
                        <td>
                            <button class="btn" onclick="viewProjectDetails('\${project.id}')">View</button>
                        </td>
                    \`;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        }
        
        // Load contractors
        async function loadContractors() {
            try {
                const response = await fetch('/api/contractors');
                const contractors = await response.json();
                
                const tableBody = document.querySelector('#contractors-table tbody');
                tableBody.innerHTML = '';
                
                contractors.forEach(contractor => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${contractor.name}</td>
                        <td>\${contractor.email}</td>
                        <td>\${contractor.phone}</td>
                        <td>\${contractor.contact_name}</td>
                        <td><span class="status active">\${contractor.status}</span></td>
                        <td>
                            <button class="btn" onclick="viewContractorDetails('\${contractor.id}')">View</button>
                        </td>
                    \`;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading contractors:', error);
            }
        }
        
        // Load all data
        async function loadAllData() {
            showLoading();
            await Promise.all([
                loadDashboardStats(),
                loadEmails(),
                loadBids(),
                loadProjects(),
                loadContractors()
            ]);
            hideLoading();
        }
        
        // Tab switching functionality
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                const tabName = tab.getAttribute('data-tab');
                document.getElementById(tabName).classList.add('active');
            });
        });
        
        // Refresh button functionality
        document.getElementById('refreshButton').addEventListener('click', loadAllData);
        
        // Create simple alert for view functions (to be replaced with proper modals)
        function viewEmailDetails(id) {
            alert(\`Viewing email details for ID: \${id}\nIn a full implementation, this would open a detailed view.\`);
        }
        
        function viewBidDetails(id) {
            alert(\`Viewing bid details for ID: \${id}\nIn a full implementation, this would open a detailed view.\`);
        }
        
        function viewProjectDetails(id) {
            alert(\`Viewing project details for ID: \${id}\nIn a full implementation, this would open a detailed view.\`);
        }
        
        function viewContractorDetails(id) {
            alert(\`Viewing contractor details for ID: \${id}\nIn a full implementation, this would open a detailed view.\`);
        }
        
        // Handle "New" buttons
        document.getElementById('newEmailButton').addEventListener('click', () => {
            const subject = prompt('Email Subject:');
            if (!subject) return;
            
            const sender = prompt('Sender Email:');
            if (!sender) return;
            
            const body = prompt('Email Body:');
            if (!body) return;
            
            const data = {
                subject,
                sender_email: sender,
                recipient_email: 'procurement@company.com',
                received_date: new Date().toISOString(),
                body,
                email_type: 'general_inquiry',
                processing_status: 'pending'
            };
            
            showLoading();
            fetch('/api/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(() => {
                loadEmails();
                loadDashboardStats();
                hideLoading();
                alert('Email created successfully!');
            })
            .catch(error => {
                console.error('Error creating email:', error);
                hideLoading();
                alert('Error creating email');
            });
        });
        
        // Load data on page load
        document.addEventListener('DOMContentLoaded', loadAllData);
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);
  console.log('Created simple frontend');
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bid Beacon Manager running on http://localhost:${PORT}`);
});