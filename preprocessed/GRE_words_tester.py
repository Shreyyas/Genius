import csv, json

filename = 'GRE.txt'

def read_word_list(filename):
	count      = 0
	current    = ''
	previous   = ''
	definition = ''
	word       = ''
	wordToDefMap = {}
	lineCount = 0
	with open(filename, 'rb') as f:
		for line in f:
			current = line
			if current == '\n' and previous != '\n':
				#space
				count += 1
				if count % 2 == 0:
					wordToDefMap[word] = definition
			elif count % 2 == 0 and current != '\n':
				#word
				word = line.strip('\n').upper()
				if len(word.split()) != 1:
					print "ERROR: There is a spacing issue in the file. Please fix at the following location: \n"
					print "LINE: ", lineCount
					print "WORD: ", word
					print "DEFINITION: ", definition 
					break
			elif count %2 != 0 and current != '\n' and previous != '\n':
				#multiple sentence definition
				definition += " " + line.strip('\n')
			elif count % 2 != 0 and current != '\n':
				#definition
				definition = line.strip('\n')
			previous = current
			lineCount += 1
	return wordToDefMap

if __name__ == '__main__':
	wordToDefMap = read_word_list(filename)

	with open('../data/GRE_words.json', 'w') as fp:
		json.dump(wordToDefMap, fp)