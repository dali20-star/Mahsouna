# Generated migration to update role choices

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            code=lambda apps, schema_editor: None,  # Forward migration - no data changes needed
            reverse_code=lambda apps, schema_editor: None,  # Reverse - no data changes needed
        ),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[('creator', 'Content Creator'), ('manager', 'Manager'), ('admin', 'Administrator')],
                default='creator',
                max_length=20
            ),
        ),
    ]
