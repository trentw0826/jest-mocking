const CatFact = require('../CatFact');

describe('CatFact', () => {

  // Reset all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Tests the constructor for empty initial state
  test('initializes with empty history', () => {
    const catFact = new CatFact();
    expect(catFact.history()).toEqual([]);
  });

  // Tests if add() fetches and stores a fact correctly
  test('add() fetches a fact, returns it, and stores it', async () => {
    const testMsg = "cats sleep 70% of their lives";

    // Mock the global fetch function
    global.fetch = jest.fn((url) => {
      return Promise.resolve({
        json: () => {
          if (url === 'https://meowfacts.herokuapp.com/') {
            return Promise.resolve({ data: [testMsg] });
          }
          return Promise.reject(new Error('unknown url'));
        }
      })
    });

    const catFact = new CatFact();
    const result = await catFact.add();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe(testMsg);
    expect(catFact.history()).toEqual([testMsg]);
  });

  test('add() returns null and does not modify history on error', async () => {
    global.fetch = jest.fn(() => {
      return Promise.reject(new Error('network error'));
    });

    const catFact = new CatFact();

    const result = await catFact.add();

    expect(result).toBeNull();
    expect(catFact.history()).toEqual([]);
  });

  
  test('history() returns a previously added fact', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: ['fact one'],
      }),
    });

    const catFact = new CatFact();

    await catFact.add();

    expect(catFact.history()).toEqual(['fact one']);
  });

  test('history() returns all previously added facts for multiple facts', async () => {
    const facts = ['fact one', 'fact two', 'fact three'];
    
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ data: [facts[0]] }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ data: [facts[1]] }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ data: [facts[2]] }),
      });

    const catFact = new CatFact();

    await catFact.add();
    await catFact.add();
    await catFact.add();

    expect(catFact.history()).toEqual(facts);
    expect(catFact.history().length).toBe(3);
  });


  test('call() invokes callback with returned fact', async () => {
    jest.useFakeTimers();

    const catFact = new CatFact();
    const callback = jest.fn();

    jest.spyOn(catFact, 'add').mockResolvedValue('scheduled fact');

    catFact.call(1000, callback);

    jest.advanceTimersByTime(1000);
    await Promise.resolve(); // flush microtasks

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('scheduled fact');

    jest.useRealTimers();
  });

  test('call() passes null to callback when add() fails', async () => {
    jest.useFakeTimers();

    const catFact = new CatFact();
    const callback = jest.fn();

    jest.spyOn(catFact, 'add').mockResolvedValue(null);

    catFact.call(500, callback);

    jest.advanceTimersByTime(500);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith(null);

    jest.useRealTimers();
  });
});
