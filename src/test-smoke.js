/**
 * Quick smoke test for VectorDB API endpoints
 * Tests: /items, /search, /benchmark, /hnsw-info, /stats
 */

import axios from 'axios';

const API = 'http://localhost:8080';

function assertArray(value, label, payload) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} missing or invalid: ${JSON.stringify(payload)}`);
  }
}

async function test() {
  console.log('\n🧪 VectorDB API Smoke Test\n');

  try {
    // Test 1: Get all items
    console.log('1️⃣  Testing /items...');
    const itemsRes = await axios.get(`${API}/items`);
    console.log(`   ✓ Loaded ${itemsRes.data.length} demo vectors`);
    if (itemsRes.data.length < 20) {
      console.log('   ⚠ WARNING: Expected 20 demo vectors');
    }

    // Test 2: Get stats
    console.log('2️⃣  Testing /stats...');
    const statsRes = await axios.get(`${API}/stats`);
    console.log(`   ✓ Algorithms: ${statsRes.data.algorithms.join(', ')}`);
    console.log(`   ✓ Metrics: ${statsRes.data.metrics.join(', ')}`);

    // Test 3: Test search with a sample vector
    console.log('3️⃣  Testing /search...');
    const sampleEmb = itemsRes.data[0].embedding;
    const searchRes = await axios.get(`${API}/search`, {
      params: {
        v: sampleEmb.join(','),
        k: 5,
        metric: 'cosine',
        algo: 'hnsw'
      }
    });
    assertArray(searchRes.data.results, '/search results', searchRes.data);
    console.log(`   ✓ Found ${searchRes.data.results.length} results`);
    console.log(`   ✓ Latency: ${searchRes.data.latencyUs} μs`);

    // Test 4: Test benchmark
    console.log('4️⃣  Testing /benchmark...');
    const benchRes = await axios.get(`${API}/benchmark`, {
      params: {
        v: sampleEmb.join(','),
        k: 5,
        metric: 'cosine'
      }
    });
    console.log(`   ✓ Brute Force: ${benchRes.data.bruteforceUs} μs`);
    console.log(`   ✓ KD-Tree: ${benchRes.data.kdtreeUs} μs`);
    console.log(`   ✓ HNSW: ${benchRes.data.hnswUs} μs`);

    // Test 5: Test HNSW info
    console.log('5️⃣  Testing /hnsw-info...');
    const infoRes = await axios.get(`${API}/hnsw-info`);
    console.log(`   ✓ HNSW nodes: ${infoRes.data.nodeCount}`);
    console.log(`   ✓ Top layer: ${infoRes.data.topLayer}`);
    console.log(`   ✓ Nodes per layer: ${infoRes.data.nodesPerLayer.join(', ')}`);

    // Test 6: Test insert
    console.log('6️⃣  Testing POST /insert...');
    const newVec = Array(16).fill(0.5);
    const insertRes = await axios.post(`${API}/insert`, {
      metadata: 'Test vector',
      category: 'cs',
      embedding: newVec
    });
    console.log(`   ✓ Inserted vector with ID: ${insertRes.data.id}`);

    // Test 7: Test delete
    console.log('7️⃣  Testing DELETE /delete...');
    const deleteRes = await axios.delete(`${API}/delete/${insertRes.data.id}`);
    console.log(`   ✓ Deleted vector: ${deleteRes.data.ok}`);

    // Test 8: Test status
    console.log('8️⃣  Testing /status...');
    const statusRes = await axios.get(`${API}/status`);
    console.log(`   ✓ Ollama: ${statusRes.data.ollamaAvailable ? '✓ ONLINE' : '✗ OFFLINE'}`);
    console.log(`   ✓ Embed model: ${statusRes.data.embedModel}`);
    console.log(`   ✓ Gen model: ${statusRes.data.genModel}`);

    console.log('\n✅ All tests passed!\n');
    console.log('The JavaScript VectorDB is ready to use.\n');
    console.log('To start the server: npm start');
    console.log('Then open: http://localhost:8080\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

test();
