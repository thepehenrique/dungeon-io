#!/usr/bin/env python3
"""Regression checks for the editable, connected map (stdlib only)."""
from collections import Counter
from copy import deepcopy
import json
import struct
import unittest

from generate_dungeon_map import (
    ASSET_DIR, SOURCE, OUTPUT, REGION_ENEMY_POOLS, build_runtime_map,
    find_layer, properties_by_name, reachable_cells,
)


class DungeonMapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(SOURCE.read_text())
        cls.runtime = build_runtime_map(cls.source)

    def test_runtime_is_generated_from_editable_source(self):
        self.assertEqual(self.runtime, json.loads(OUTPUT.read_text()))
        ids = [o['id'] for l in self.runtime['layers'] for o in l.get('objects', [])]
        self.assertEqual(len(ids), len(set(ids)))

    def test_tilesets_and_layer_dimensions(self):
        m = self.source
        ranges = []
        for t in m['tilesets']:
            # PNG IHDR dimensions, without requiring Pillow for this check.
            png = (ASSET_DIR / t['image']).read_bytes()
            self.assertEqual(png[:8], b'\x89PNG\r\n\x1a\n')
            self.assertEqual(struct.unpack('>II', png[16:24]), (t['imagewidth'], t['imageheight']))
            ranges.append(range(t['firstgid'], t['firstgid'] + t['tilecount']))
        for layer in m['layers']:
            if layer['type'] != 'tilelayer':
                continue
            self.assertEqual((layer['width'], layer['height']), (m['width'], m['height']))
            self.assertEqual(len(layer['data']), m['width'] * m['height'])
            for gid in set(layer['data']) - {0}:
                self.assertEqual(sum(gid in r for r in ranges), 1)

    def test_all_walkable_floor_is_connected(self):
        m = self.runtime
        start = find_layer(m, 'PlayerSpawns')['objects'][0]
        collision = find_layer(m, 'Collision')['data']
        reachable = reachable_cells((int(start['x']//16), int(start['y']//16)), m['width'], m['height'], collision)
        floor = find_layer(m, 'Floor')['data']
        for i, gid in enumerate(floor):
            if gid and not collision[i]:
                self.assertIn((i % m['width'], i // m['width']), reachable)

    def test_regional_budgets_and_pools(self):
        objects = find_layer(self.source, 'Gameplay')['objects']
        regions = {properties_by_name(o)['region']: properties_by_name(o)['enemyBudget']
                   for o in objects if o.get('type') == 'region'}
        spawns = find_layer(self.runtime, 'EnemySpawns')['objects']
        counts = Counter(properties_by_name(o)['region'] for o in spawns)
        self.assertEqual(dict(counts), regions)
        for spawn in spawns:
            p = properties_by_name(spawn)
            self.assertIn(p['enemyType'], REGION_ENEMY_POOLS[p['region']])

    def test_variable_rooms_and_budget(self):
        m = deepcopy(self.source)
        objects = find_layer(m, 'Gameplay')['objects']
        room = next(o for o in objects if o.get('type') == 'room'
                    and properties_by_name(o).get('region') == 'goblin_den'
                    and properties_by_name(o).get('combat', True))
        objects.remove(room)
        region = next(o for o in objects if o.get('type') == 'region'
                      and properties_by_name(o)['region'] == 'goblin_den')
        next(p for p in region['properties'] if p['name'] == 'enemyBudget')['value'] = 10
        result = build_runtime_map(m)
        counts = Counter(properties_by_name(o)['region']
                         for o in find_layer(result, 'EnemySpawns')['objects'])
        self.assertEqual(counts['goblin_den'], 10)

    def test_obstacle_collision_and_configured_vision(self):
        collision = find_layer(self.runtime, 'Collision')['data']
        vision = find_layer(self.runtime, 'VisionBlockers')['data']
        for obj in find_layer(self.source, 'Gameplay')['objects']:
            p = properties_by_name(obj)
            if p.get('region') != 'goblin_den' or obj.get('type') not in ('obstacle', 'water'):
                continue
            for y in range(int(obj['y']//16), int((obj['y']+obj['height'])//16)):
                for x in range(int(obj['x']//16), int((obj['x']+obj['width'])//16)):
                    i = y*self.runtime['width']+x
                    self.assertTrue(collision[i])
                    self.assertEqual(bool(vision[i]), p['blocksVision'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
