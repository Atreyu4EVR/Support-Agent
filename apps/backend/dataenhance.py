import os
import pandas as pd
from dotenv import load_dotenv
from openai import AzureOpenAI
import time
import logging
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

prompt = """
You are an expert web scraper at BYU-Idaho tasked with cleaning web content (formatted in Markdown) as part of knowledge extraction for an AI RAG agent (to later be embedded and be stored in a vector database). 

Original URL: {url}
    Page Title: {title}
    
    Content to clean:
    {content}  

For context: the AI RAG Agent needs high-quality search results to answer support queries at BYUI. To do this, you will:

1. Analyze the content & identify the data that should be removed
2. Tag content that is potentially noisy (like button links or urls)
3. Ask yourself "Does this tagged content provide value to the content"
4. If the content doesn't provide any sort of value, remove it
5. Return content in Markdown format
6. Do not add comments or explanation to final output, just the cleaned article

Types of Content to Remove:
- Markdown images/files (like "[![Apply](https://brightspotcdn.byui.edu/b1/96/c5adc8ba462f83d6c1649e13dc9e/clipboard-checklist-byu-royal.svg)"
- Date/timestamps (like "July 29, 2025 10:21 AM")
- Broken links, poor syntax, unecessary escape characters, etc

Example Output:
Here is an example of a well-cleaned web page:
# Federal Financial Aid Distribution\n\n## Review and Accept Financial Aid Through the Financial Aid Portal\n\n## What You Need to Know About Financial Aid Distribution\n\n### How Financial Aid is Disbursed\n\n### State Scholarships\n\n### How can I tell if my financial aid has been processed?\n\n### Receiving Remaining Financial Aid Funds\n\n### Submitting FAFSA After Priority Deadlines\n\nThe Financial Aid Portal is your central hub for managing financial aid.\n\nFor details on when award amounts will be available, be sure to review the information provided further down this webpage.\n\n[Financial Aid Portal](https://byuistudentxprod.regenteducation.net/)\n\nThe processing of BYU-Idaho Scholarships and Federal Financial Aid starts on the first day of the semester.\n\nOutside scholarships can take longer depending on the individual award\n\n**Idaho Launch:**\n\nEnrolled in 12 or more [Program Applicable](https://web.byui.edu/financialaid/classes) credits:\n\nFewer than 12 credits:\n\nBe sure to pay your 20% of tuition to avoid late fees.\n\n**Idaho Opportunity Scholarships:**\n\nEnrolled in 12 or more credits:\n\nFewer than 12 credits:\n\nIf your money has not been disbursed after the first week of the semester, please email [idahostateaid@byui.edu](mailto:idahostateaid@byui.edu).\n\nIn your financial aid portal:\n\nWhen your financial aid status is Paid in your financial aid portal, it follows this process:\n\n**Financial Aid Office**\n\n196 Kimball Building\n\nRexburg, ID 83460-1610\n\n[208-496-1411](tel:2084961411)\n\n[financialaid@byui.edu](mailto:financialaid@byui.edu)\n\nCall or Text [208-496-1411](tel:2084961411)\n\n[ask@byui.edu](mailto:ask@byui.edu)\n\n[WhatsApp](https://www.byui.edu/whatsapp/)\n\n[Get Help](https://www.byui.edu/contact-us/)

Format your response as JSON with these fields:
    - "summary": brief summary
    - "key_info": list of important details
    - "keywords": list of relevant keywords
    - "topics": list of main topics
    - "enhanced_content": improved and structured version of the original content

"""

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

def enrich_content(content, title, url):
    """
    Enrich the content by extracting key information, summarizing, and structuring it.
    """
    formatted_prompt = prompt.format(url=url, title=title, content=content[:3000])
    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1"),
            messages=[
                {"role": "system", "content": "You are a helpful assistant that enriches and structures content from university websites."},
                {"role": "user", "content": formatted_prompt}
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error enriching content for {url}: {e}")
        return None

def process_excel_file(input_file, output_file):
    """
    Process the Excel file and enrich the content column with resumption capability.
    """
    logger.info(f"Reading Excel file: {input_file}")
    df = pd.read_excel(input_file)
    
    logger.info(f"Found {len(df)} rows to process")
    
    # Check if output file exists (resumption)
    if os.path.exists(output_file):
        logger.info(f"Output file exists, loading existing progress: {output_file}")
        existing_df = pd.read_excel(output_file)
        
        # Find rows that already have enriched content
        processed_mask = existing_df['enriched_content'].notna() & (existing_df['enriched_content'] != '')
        processed_count = processed_mask.sum()
        
        logger.info(f"Found {processed_count} already processed rows")
        
        # Use existing dataframe if it has the same structure
        if len(existing_df) == len(df) and 'enriched_content' in existing_df.columns:
            df = existing_df
        else:
            # Add new columns for enriched data
            df['enriched_content'] = ''
    else:
        # Add new columns for enriched data
        df['enriched_content'] = ''
    
    # Process each row
    for index, row in df.iterrows():
        # Skip if already processed
        if pd.notna(row.get('enriched_content')) and row.get('enriched_content') != '':
            logger.info(f"Skipping row {index + 1}/{len(df)} - already processed: {row['title'][:50]}...")
            continue
            
        logger.info(f"Processing row {index + 1}/{len(df)}: {row['title'][:50]}...")
        
        # Skip if content is empty or too short
        if pd.isna(row['content']) or len(str(row['content'])) < 100:
            logger.info(f"Skipping row {index + 1} - insufficient content")
            continue
        
        # Enrich the content
        enriched = enrich_content(row['content'], row['title'], row['url'])
        
        if enriched:
            try:
                # Try to parse as JSON
                enriched_data = json.loads(enriched)
                
                df.at[index, 'enriched_content'] = enriched_data.get('enhanced_content', '')
                
            except json.JSONDecodeError:
                # If JSON parsing fails, store the raw enriched content
                logger.warning(f"Could not parse JSON for row {index + 1}, storing raw content")
                df.at[index, 'enriched_content'] = enriched
        
        # Save progress after each row (resumption capability)
        logger.info(f"Saving progress after row {index + 1}")
        df.to_excel(output_file, index=False)
        
        # Add a small delay to avoid rate limiting
        time.sleep(1)
    
    # Final save
    logger.info(f"Final save to: {output_file}")
    df.to_excel(output_file, index=False)
    logger.info("Processing complete!")

if __name__ == "__main__":
    input_file = "../../documents/output.xlsx"
    output_file = "../../documents/enriched_output.xlsx"
    
    process_excel_file(input_file, output_file)