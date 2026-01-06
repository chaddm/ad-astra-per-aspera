## Function: table_from_csv

### Overview

Converts CSV string content into a properly formatted Markdown table with aligned columns.

### Purpose

To provide users and tools with the ability to transform CSV data into readable, properly aligned Markdown tables suitable for documentation, reports, and display.

### Requirements

#### Functional Requirements

1. **CSV Parsing**: The function must use a proper CSV parsing library to handle:
   - Quoted fields (e.g., `"field with, comma"`)
   - Escaped characters within fields (e.g., `"field with ""quotes"""`)
   - Standard CSV format compliance
   
2. **Header Row**: The function must assume the first row is always the header row and create a separator line between headers and data rows.

3. **Column Alignment**: 
   - Text columns must be left-aligned
   - Numeric columns must be right-aligned and aligned to the decimal point
   - Numbers are identified as strings containing only digits and delimiters (commas, periods)
   - When numbers in a column have different formats (e.g., `1000`, `4.5`, `123.456`), reformat all numbers to the highest complexity (most decimal places, include thousand separators consistently)
   
4. **Column Width**: Each column width must be calculated to fit the largest element in that column (including headers).

5. **Empty/Missing Values**:
   - Empty cells are rendered as empty in the table
   - Rows with fewer columns than the header are treated as having empty trailing columns
   - Rows with more columns than the header have extra columns ignored
   
6. **Edge Cases**:
   - Empty string input returns empty string
   - Single column tables are supported
   - Headers are always present (first row)
   
7. **Input/Output**: 
   - Input: String containing CSV content
   - Output: String containing formatted Markdown table

#### Non-Functional Requirements

1. **CSV Library**: Must use a robust CSV parsing library (e.g., `csv-parse`, `papaparse`) from npm.
2. **Readability**: Output must be human-readable with properly aligned columns.
3. **Standard Compliance**: Output must comply with GitHub Flavored Markdown table syntax.

### Acceptance Criteria

- [ ] Function accepts a string parameter containing CSV content
- [ ] Function returns a properly formatted Markdown table string
- [ ] Column widths are aligned to the largest element in each column
- [ ] Text columns are left-aligned
- [ ] Numeric columns are right-aligned and aligned to decimal points
- [ ] Numbers with different formats in the same column are normalized to highest complexity
- [ ] First row is treated as header with separator line
- [ ] Empty cells are handled correctly
- [ ] Rows with mismatched column counts are handled per requirements
- [ ] Empty string input returns empty string
- [ ] Single column tables work correctly
- [ ] Properly handles quoted fields and escaped characters via CSV library

### Test Cases

The following tests should be implemented to ensure complete coverage of the `table_from_csv` functionality:

#### Basic Functionality Tests
- **Test basic CSV to Markdown conversion** - Converts simple CSV with headers and data rows to properly formatted Markdown table
- **Test single column table** - Handles CSV with only one column correctly
- **Test empty string input** - Returns empty string when given empty input
- **Test CSV with only headers** - Handles CSV that contains headers but no data rows

#### Column Alignment Tests
- **Test text columns are left-aligned** - Verifies text content is left-aligned with proper spacing
- **Test numeric columns are right-aligned** - Verifies numeric content is right-aligned
- **Test mixed text and numeric columns** - Correctly applies different alignment to different column types in same table
- **Test decimal point alignment** - Numbers in same column align to decimal point

#### Number Formatting & Normalization Tests
- **Test number normalization to highest complexity** - Numbers with different decimal places get normalized (e.g., 60000 becomes 60000.000 when column has 123.456)
- **Test integers get decimal places added** - Whole numbers receive decimal places matching column's highest precision
- **Test mixed number formats** - Handles mix of integers and decimals (1000, 4.5, 123.456) correctly
- **Test all integers in numeric column** - Handles column with only whole numbers

#### Quoted Fields & Special Characters Tests
- **Test quoted fields with commas** - Properly handles fields like "field with, comma"
- **Test escaped quotes within fields** - Correctly processes "field with ""quotes"""
- **Test mixed quoted and unquoted fields** - Handles combination of quoted and unquoted fields in same CSV
- **Test special characters in fields** - Preserves special characters within fields

#### Empty/Missing Value Tests
- **Test empty cells in middle of row** - Empty cells render as empty in table
- **Test empty cells at end of row** - Trailing empty cells handled correctly
- **Test rows with fewer columns than header** - Treats missing columns as empty trailing columns
- **Test rows with more columns than header** - Ignores extra columns beyond header count
- **Test completely empty data row** - Handles row with all empty fields

#### Column Width Calculation Tests
- **Test column width fits largest element** - Each column width accommodates its widest content
- **Test column width includes header text** - Column width considers header length
- **Test varying content lengths** - Properly pads shorter content to match column width

#### Markdown Format Compliance Tests
- **Test separator line format** - Separator line contains correct number of dashes for each column
- **Test separator line position** - Separator appears between header and first data row
- **Test pipe delimiter usage** - Proper pipe characters at start, end, and between columns
- **Test GitHub Flavored Markdown compliance** - Output conforms to GFM table syntax

#### Example-Based Integration Tests
- **Test Example 1: Basic table with mixed types** - Full test of Name/Age/Salary example from spec
- **Test Example 2: Quoted fields and empty cells** - Full test of Product/Price/Stock example from spec
- **Test Example 3: Empty input** - Verify empty CSV returns empty string

**Total: ~32 test cases** covering all functional requirements, edge cases, and acceptance criteria.

### Example Input/Output

#### Example 1: Basic table with mixed types
Input:
```csv
Name,Age,Salary
Alice,30,75000.50
Bob,25,60000
Charlie,35,85123.456
```

Output:
```markdown
| Name    |  Age |    Salary |
|---------|------|-----------|
| Alice   |   30 | 75000.500 |
| Bob     |   25 | 60000.000 |
| Charlie |   35 | 85123.456 |
```

#### Example 2: With quoted fields and empty cells
Input:
```csv
Product,"Price, USD",Stock
"Widget, Large",1250.5,100
Small Widget,,50
"Special ""Premium"" Widget",2000,
```

Output:
```markdown
| Product                  | Price, USD | Stock |
|--------------------------|------------|-------|
| Widget, Large            |    1250.5  |   100 |
| Small Widget             |            |    50 |
| Special "Premium" Widget |    2000.0  |       |
```

#### Example 3: Empty input
Input:
```csv
```

Output:
```
```

### Out of Scope for table_from_csv

- Custom delimiter support (only standard CSV comma delimiters)
- Custom alignment overrides
- Table caption or title generation
- CSV validation or error reporting beyond basic parsing
- Multi-line cell content handling beyond what the CSV parser supports
- Column type detection beyond numeric pattern matching

---
