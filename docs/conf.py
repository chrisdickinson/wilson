import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "_ext")))
extensions = []
source_suffix = '.txt'
master_doc = 'contents'
project = 'Wilson'
copyright = '2010 Chris Dickinson'
version = '0.0.1'
release = '0.0.1'

today_fmt = '%B %d, %Y'
exclude_patterns = ['_build']
add_function_parentheses = True
add_module_names = False
show_authors = False
pygments_style = 'trac'
exclude_dirnames = ['.svn','.git']
html_theme_path = ['_theme']
html_theme = 'default'
html_static_path = ['_static']
html_last_updated_fmt = '%b %d, %Y'
html_use_smartypants = True
html_additional_pages = {}
htmlhelp_basename = 'Wilsondoc'
modindex_common_prefix = ['wilson.']
