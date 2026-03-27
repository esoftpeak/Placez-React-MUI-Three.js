import React, { useState } from 'react';
import { TextField, Chip, Box, Button } from '@mui/material';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const PlacezTagger: React.FC<TagsInputProps> = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState<string>('');

  // Function to add a tag
  const addTag = () => {
    if (inputValue.trim() !== '') {
      const newTags = [...tags, inputValue.trim()];
      onChange(newTags);
      setInputValue('');
    }
  };

  // Handler for Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission if inside a form
      addTag();
    }
  };

  // Handler for deleting a tag
  const handleDeleteTag = (tagToDelete: string) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    onChange(newTags);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <TextField
          variant="outlined"
          label="Add Tag"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={addTag}
          sx={{ marginLeft: 1, height: '56px' }} // Adjust height to match TextField
        >
          Add
        </Button>
      </Box>
      <Box mt={2}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            sx={{ marginRight: 1, marginBottom: 1 }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PlacezTagger;
