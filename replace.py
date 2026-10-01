import sys

files = [
    'frontend/src/pages/admin/Payments.jsx',
    'frontend/src/pages/admin/Dashboard.jsx'
]

replacement = "<span style={{fontWeight:'bold'}}>TK</span>"

for f in files:
    content = open(f, 'r').read()
    content = content.replace("<FiDollarSign />", replacement)
    open(f, 'w').write(content)
print("Replaced successfully")
