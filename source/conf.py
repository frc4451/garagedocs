# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "ROBOTZ Garage Development"
copyright = "2024, FRC 4451 - ROBOTZ Garage"
author = "FRC 4451 - ROBOTZ Garage"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ["_templates"]
exclude_patterns = []
extensions = [
    "sphinx_contributors",
    "sphinx_design",
    "sphinx.ext.todo",
]


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_title = "ROBOTZ Garage Programming"

html_theme = "pydata_sphinx_theme"
html_static_path = ["_static"]

html_theme_options = {
    "show_nav_level": 1,
    "icon_links": [
        {
            "name": "GitHub",
            "url": "https://github.com/frc4451/garagedocs",
            "icon": "fa-brands fa-github",
            "type": "fontawesome",
        }
    ],
}
