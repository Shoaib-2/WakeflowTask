import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse JSON bodies
app.use(express.json());


// Function to encode a string to base64
export const base64Encode = async (req, res) => {
    try {
        // Extract the input from the request body - must be named 'input'
        const {input} = req.body;

        // Validate the input exists
        if (input === undefined) {
           return res.status(400).json({error: "Input field in the request body is required"});
        }

        // Encode the input to base64
        const output = Buffer.from(input).toString('base64');

        // Return the output as JSON
        res.json({output});
    } catch (error) {
        res.status(500).json(
            {
                error: "An error occurred while processing your request",
                message: error.message
            });
    }
};

// Route to get function documentation /functions/base64Encode
app.route('/functions/base64Encode')
  // GET: Return function documentation
  .get((req, res) => {
    try {
      // Return docs object directly, as required by func.live
      res.json({
        name: "base64Encode",
        description: "Encode anything to base64",
        input: {
          type: "string",
          description: "Input the data you'd like to encode to base64",
          example: "Hello, world"
        },
        output: {
          type: "string",
          description: "Base64 encoded string",
          example: "SGVsbG8sIHdvcmxk"
        }
      });
    } catch (error) {
      res.status(500).json({
        error: "Error retrieving function documentation"
      });
    }
  })
  // POST: Execute the function
  .post(base64Encode);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  const baseUrl = 'https://wakeflow-task.vercel.app/functions';
  console.log(`Server running on port ${PORT}`);
  console.log(`Function docs: GET ${baseUrl}/functions/base64Encode`);
  console.log(`Function endpoint: POST ${baseUrl}/functions/base64Encode`);
});

// Test token validation endpoint
app.post('/test-submission', async (req, res) => {
  const token = process.env.FUNC_TOKEN; 
  console.log("Token:", token);
  const url = "https://wakeflow-task.vercel.app/functions/base64Encode";
  
  try {
    const response = await fetch('https://api.func.live/functions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url })
    });
    
    const result = await response.text();
    
    res.json({
      status: response.status,
      statusText: response.statusText,
      response: result
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Export the base64Encode function for testing
export default app;
