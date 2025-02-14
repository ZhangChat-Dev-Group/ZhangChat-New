exports.verifyTrip = trip => typeof trip === 'string' && /^[a-zA-Z0-9/\+]{6}$/.test(trip);
exports.verifyNick = nick => typeof nick === 'string' && /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,24}$/.test(nick);
exports.verifyChannel = channel => typeof channel === 'string' && /^[\u4e00-\u9fa5_a-zA-Z0-9\-]{1,30}$/.test(channel);
exports.verifyText = text => {
  // verifies user input is text
  if (typeof text !== 'string') {
    return false;
  }

  let sanitizedText = text;

  // strip newlines from beginning and end
  sanitizedText = sanitizedText.replace(/^\s*\n|^\s+$|\n\s*$/g, '');
  // replace 3+ newlines with just 2 newlines
  sanitizedText = sanitizedText.replace(/\n{3,}/g, '\n\n');

  return sanitizedText;
};