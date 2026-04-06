"""Lightweight tests for bin/openbuddy helpers (stdlib unittest)."""
from __future__ import annotations

import importlib.util
import os
import unittest
from importlib.machinery import SourceFileLoader
from pathlib import Path


def _load_openbuddy():
    root = Path(__file__).resolve().parent.parent
    path = (root / "bin" / "openbuddy").resolve()
    if not path.is_file():
        raise FileNotFoundError(path)
    # Extensionless script: spec_from_file_location is unreliable across Python versions
    loader = SourceFileLoader("openbuddy_bin", str(path))
    spec = importlib.util.spec_from_loader(loader.name, loader)
    if spec is None or spec.loader is None:
        raise ImportError(f"could not load spec for {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ob = _load_openbuddy()


class TestWatchInterval(unittest.TestCase):
    def tearDown(self) -> None:
        os.environ.pop("OPENBUDDY_WATCH_INTERVAL", None)

    def test_default(self) -> None:
        os.environ.pop("OPENBUDDY_WATCH_INTERVAL", None)
        self.assertEqual(ob._watch_interval_seconds(), 6.0)

    def test_custom(self) -> None:
        os.environ["OPENBUDDY_WATCH_INTERVAL"] = "12"
        self.assertEqual(ob._watch_interval_seconds(), 12.0)

    def test_float(self) -> None:
        os.environ["OPENBUDDY_WATCH_INTERVAL"] = "1.5"
        self.assertEqual(ob._watch_interval_seconds(), 1.5)

    def test_clamp_low(self) -> None:
        os.environ["OPENBUDDY_WATCH_INTERVAL"] = "0.1"
        self.assertEqual(ob._watch_interval_seconds(), 0.5)

    def test_clamp_high(self) -> None:
        os.environ["OPENBUDDY_WATCH_INTERVAL"] = "99999"
        self.assertEqual(ob._watch_interval_seconds(), 3600.0)

    def test_invalid_falls_back(self) -> None:
        os.environ["OPENBUDDY_WATCH_INTERVAL"] = "nope"
        self.assertEqual(ob._watch_interval_seconds(), 6.0)


class TestCompactAndPanelWidth(unittest.TestCase):
    def tearDown(self) -> None:
        os.environ.pop("OPENBUDDY_COMPACT", None)

    def test_compact_env_on(self) -> None:
        os.environ["OPENBUDDY_COMPACT"] = "1"
        self.assertTrue(ob._want_compact(200))

    def test_compact_env_off(self) -> None:
        os.environ["OPENBUDDY_COMPACT"] = "0"
        self.assertFalse(ob._want_compact(10))

    def test_compact_by_width(self) -> None:
        os.environ.pop("OPENBUDDY_COMPACT", None)
        self.assertTrue(ob._want_compact(40))
        self.assertFalse(ob._want_compact(50))

    def test_panel_width_none(self) -> None:
        self.assertEqual(ob._panel_width(None), 38)

    def test_panel_width_clamped(self) -> None:
        self.assertEqual(ob._panel_width(100), 38)
        self.assertEqual(ob._panel_width(30), 29)


if __name__ == "__main__":
    unittest.main()
