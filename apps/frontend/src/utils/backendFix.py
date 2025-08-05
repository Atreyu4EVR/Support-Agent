# Backend fix suggestion for api.py
# Replace the get_flush_content_and_remainder function with this improved version:

def get_flush_content_and_remainder(buffer: str, new_content: str) -> tuple[str, str]:
    """
    Improved intelligent buffering that prevents word concatenation.
    
    Returns:
        tuple: (content_to_flush, content_to_keep_in_buffer)
    """
    if not new_content:
        return buffer, ""
    
    if not buffer:
        return "", new_content
    
    combined = buffer + new_content
    
    # Critical fix: Check for word concatenation BEFORE any other processing
    buffer_trimmed = buffer.rstrip()
    content_trimmed = new_content.lstrip()
    
    if (buffer_trimmed and content_trimmed and 
        not buffer.endswith((' ', '\n', '\t', '.', '!', '?', ':', ';', ',')) and 
        not new_content.startswith((' ', '\n', '\t')) and
        buffer_trimmed[-1].isalnum() and content_trimmed[0].isalnum()):
        
        # Insert space to prevent concatenation
        # Return the buffer with space + the new content
        return buffer + " " + new_content, ""
    
    # Rest of the original logic remains the same...
    # If content is short, don't flush yet
    if len(combined) < 20:
        return "", combined
    
    # Always flush on sentence endings
    for punct in ['. ', '! ', '? ', ': ', '; ', '.\n', '!\n', '?\n']:
        if punct in combined:
            idx = combined.rfind(punct)
            if idx > 0:
                return combined[:idx + len(punct)], combined[idx + len(punct):]
    
    # Flush at paragraph breaks
    if '\n\n' in combined:
        idx = combined.rfind('\n\n')
        return combined[:idx + 2], combined[idx + 2:]
    
    # Flush at single line breaks with substantial content
    if '\n' in combined and len(combined) > 25:
        idx = combined.rfind('\n')
        if idx > 15:
            return combined[:idx + 1], combined[idx + 1:]
    
    # Flush at word boundaries when buffer gets long
    if len(combined) >= 40:
        for i in range(len(combined) - 1, 15, -1):
            if combined[i] == ' ' and i + 1 < len(combined) and combined[i + 1].isalnum():
                return combined[:i + 1], combined[i + 1:]
    
    # For very long content, flush at any space
    if len(combined) >= 80:
        last_space = combined.rfind(' ', 0, len(combined) - 5)
        if last_space > 20:
            return combined[:last_space + 1], combined[last_space + 1:]
    
    # Absolute maximum - flush everything but keep small remainder
    if len(combined) >= 120:
        if ' ' in combined:
            last_space = combined.rfind(' ')
            return combined[:last_space + 1], combined[last_space + 1:]
        else:
            return combined[:-10], combined[-10:]
    
    # Default: don't flush yet
    return "", combined